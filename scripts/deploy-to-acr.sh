#!/usr/bin/env bash
set -euo pipefail

# Deploy to Azure Container Registry and apply Kubernetes manifests with a chosen image tag.
# Replaces placeholders `IMAGE_URL` and `IMAGE_TAG` in the manifests and applies them.
#
# Usage examples:
#  ./scripts/deploy-to-acr.sh --acr-login-server myacr.azurecr.io --repository ciyex-app \
#    --tags "v1.2.0,latest" --deploy-tag v1.2.0 --manifest-dir manifests/stage
#
# Environment fallbacks:
#  ACR_LOGIN_SERVER - the ACR login server like myacr.azurecr.io
#  ACR_NAME - the short ACR name if you prefer to use `az acr login --name` (optional)
#  REPOSITORY - image repository/name (default: ciyex-app)
#  TAGS - comma separated tags to push
#  DEPLOY_TAG - the tag to use in the Kubernetes manifests (must be one of TAGS)
#  MANIFEST_DIR - directory containing kubernetes manifests (default: manifests/stage)

print_usage() {
  sed -n '1,120p' "$0" | sed -n '1,120p'
}

if [ "$#" -eq 0 ]; then
  echo "No arguments provided. See usage at the top of the script." >&2
  echo
  print_usage
  exit 1
fi

# Defaults
REPOSITORY="ciyex-app"
MANIFEST_DIR="manifests/stage"
TAGS=""
DEPLOY_TAG=""
ACR_LOGIN_SERVER=""
ACR_NAME=""

BUILD_ENV="stage"
TMP_ENV_FILES=()
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --acr-login-server)
      ACR_LOGIN_SERVER="$2"; shift 2;;
    --acr-name)
      ACR_NAME="$2"; shift 2;;
    --repository)
      REPOSITORY="$2"; shift 2;;
    --tags)
      TAGS="$2"; shift 2;;
    --deploy-tag)
      DEPLOY_TAG="$2"; shift 2;;
    --manifest-dir)
      MANIFEST_DIR="$2"; shift 2;;
    --build-env)
      BUILD_ENV="$2"; shift 2;;
    --dry-run)
      DRY_RUN=true; shift 1;;
    -h|--help)
      print_usage; exit 0;;
    *)
      echo "Unknown argument: $1" >&2; print_usage; exit 1;;
  esac
done

# Allow environment fallbacks
ACR_LOGIN_SERVER=${ACR_LOGIN_SERVER:-${ACR_LOGIN_SERVER_ENV:-}}
ACR_NAME=${ACR_NAME:-${ACR_NAME_ENV:-}}
REPOSITORY=${REPOSITORY:-${REPOSITORY_ENV:-ciyex-app}}
TAGS=${TAGS:-${TAGS_ENV:-}}
DEPLOY_TAG=${DEPLOY_TAG:-${DEPLOY_TAG_ENV:-}}
MANIFEST_DIR=${MANIFEST_DIR:-manifests/stage}
DRY_RUN=${DRY_RUN:-false}
BUILD_ENV=${BUILD_ENV:-stage}

if [ -z "$ACR_LOGIN_SERVER" ] && [ -n "$ACR_NAME" ]; then
  ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"
fi

if [ -z "$TAGS" ]; then
  echo "--tags is required (comma-separated). Example: --tags \"v1.0.0,latest\"" >&2
  exit 1
fi

if [ -z "$DEPLOY_TAG" ]; then
  echo "--deploy-tag is required. Pick one of the tags provided to --tags." >&2
  exit 1
fi

IFS=',' read -r -a TAG_ARRAY <<< "$TAGS"
found=false
for t in "${TAG_ARRAY[@]}"; do
  if [ "$t" = "$DEPLOY_TAG" ]; then found=true; break; fi
done
if [ "$found" = false ]; then
  echo "deploy-tag '$DEPLOY_TAG' must be one of --tags ($TAGS)" >&2
  exit 1
fi

# kubectl is required even for dry-run validation
if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl is required but not found in PATH" >&2
  exit 1
fi

# When not in dry-run mode, docker is required and we build the jar
if [ "$DRY_RUN" = false ]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "docker is required but not found in PATH" >&2
    exit 1
  fi

  # Build the Spring Boot jar
  echo "Building Spring Boot jar..."
  ./gradlew bootJar -x test

  # Ensure UI env files exist for the chosen build environment. Some Dockerfile steps copy .env.stage or .env.local
  # If the project doesn't include these files (they are .gitignored), create minimal placeholders so local builds succeed,
  # then remove them after the build.
  UI_DIRS=("ciyex-ehr-ui" "ciyex-portal-ui" "ciyex-admin-ui")
  for d in "${UI_DIRS[@]}"; do
    if [ -d "$d" ]; then
      envfile="$d/.env.$BUILD_ENV"
      if [ ! -f "$envfile" ]; then
        echo "Creating placeholder $envfile"
        # Minimal env used by the UIs; adjust as needed
        cat > "$envfile" <<EOF
NEXT_PUBLIC_API_URL=https://stg.ciyex.com/api
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
EOF
        TMP_ENV_FILES+=("$envfile")
      fi
    fi
  done
fi

# Determine image full name
if [ -z "$ACR_LOGIN_SERVER" ]; then
  echo "ACR login server not provided. Set --acr-login-server or --acr-name." >&2
  exit 1
fi

IMAGE_BASE="$ACR_LOGIN_SERVER/$REPOSITORY"

# Temporary image used for building
BUILD_TEMP_TAG="local-build"
FULL_TEMP_IMAGE="$IMAGE_BASE:$BUILD_TEMP_TAG"

if [ "$DRY_RUN" = false ]; then
  echo "Building docker image: $FULL_TEMP_IMAGE (ENVIRONMENT=$BUILD_ENV)"
  docker build --build-arg ENVIRONMENT="$BUILD_ENV" -t "$FULL_TEMP_IMAGE" .
else
  echo "[dry-run] Skipping docker build for $FULL_TEMP_IMAGE"
fi

# Optionally login to ACR using az if available and ACR_NAME provided
if command -v az >/dev/null 2>&1 && [ -n "$ACR_NAME" ]; then
  echo "Logging into ACR via az: $ACR_NAME"
  az acr login --name "$ACR_NAME"
fi

echo "Tagging and pushing tags: ${TAG_ARRAY[*]}"
for tag in "${TAG_ARRAY[@]}"; do
  full_image="$IMAGE_BASE:$tag"
  if [ "$DRY_RUN" = false ]; then
    echo "Tagging $FULL_TEMP_IMAGE -> $full_image"
    docker tag "$FULL_TEMP_IMAGE" "$full_image"
    echo "Pushing $full_image"
    docker push "$full_image"
  else
    echo "[dry-run] Would tag and push: $full_image"
  fi
done

# Remove temporary local image tag and any temporary env files we created
if [ "$DRY_RUN" = false ]; then
  echo "Removing temporary local image tag: $FULL_TEMP_IMAGE"
  docker rmi "$FULL_TEMP_IMAGE" || true
fi

if [ ${#TMP_ENV_FILES[@]} -gt 0 ]; then
  echo "Cleaning up temporary env files"
  for f in "${TMP_ENV_FILES[@]}"; do
    rm -f "$f" || true
    echo "removed $f"
  done
fi

# Prepare manifests with substituted image name and tag
TMP_MANIFEST_DIR="/tmp/ciyex-manifests-${DEPLOY_TAG}"
rm -rf "$TMP_MANIFEST_DIR"
mkdir -p "$TMP_MANIFEST_DIR"

echo "Preparing manifests in $MANIFEST_DIR -> $TMP_MANIFEST_DIR"
for f in $(find "$MANIFEST_DIR" -maxdepth 1 -type f -name "*.yaml" -o -name "*.yml"); do
  basef=$(basename "$f")
  # Replace placeholders IMAGE_URL and IMAGE_TAG
  sed "s|IMAGE_URL|$IMAGE_BASE|g; s|IMAGE_TAG|$DEPLOY_TAG|g" "$f" > "$TMP_MANIFEST_DIR/$basef"
done

echo "Applying manifests from $TMP_MANIFEST_DIR"
if [ "$DRY_RUN" = true ]; then
  echo "[dry-run] kubectl apply --dry-run=client -f $TMP_MANIFEST_DIR"
  kubectl apply --dry-run=client -f "$TMP_MANIFEST_DIR"
else
  kubectl apply -f "$TMP_MANIFEST_DIR"
fi

echo "Deployment complete. Deployed image: $IMAGE_BASE:$DEPLOY_TAG"
