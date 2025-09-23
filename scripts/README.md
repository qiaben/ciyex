# Deployment helper scripts

This folder contains helper scripts used to build, tag, push the application image to ACR and deploy Kubernetes manifests.

deploy-to-acr.sh
- Builds the Spring Boot jar, builds a Docker image, tags the image with multiple tags, pushes to ACR, substitutes
  `IMAGE_URL` and `IMAGE_TAG` in the manifests, and applies them with `kubectl`.

Prerequisites
- `docker` (for building and pushing images)
- `kubectl` (for applying manifests)
- `az` (optional, for `az acr login` if you pass `--acr-name`)
- Access to the target Kubernetes cluster (kubeconfig or context configured)

Basic usage
```
./deploy-to-acr.sh --acr-login-server myacr.azurecr.io --repository ciyex-app \
  --tags "v1.2.0,latest" --deploy-tag v1.2.0 --manifest-dir manifests/stage
```

Dry-run (no build/push)
```
./deploy-to-acr.sh --acr-login-server myacr.azurecr.io --repository ciyex-app \
  --tags "v1.2.0,latest" --deploy-tag v1.2.0 --manifest-dir manifests/stage --dry-run
```

Notes
- The Kubernetes manifests in `manifests/stage` must contain the placeholders `IMAGE_URL` and `IMAGE_TAG` where the container image is referenced (this repo already uses that pattern).
- Consider integrating this script into CI to produce reproducible, signed image builds and to avoid running Docker on CI runners that don't support it.
