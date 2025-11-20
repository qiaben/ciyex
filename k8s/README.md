# Kubernetes Deployment with Kustomize

This directory contains Kustomize configurations for deploying the Ciyex application to different environments.

## Structure

```
k8s/
├── base/                    # Base manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── kustomization.yaml
└── overlays/
    ├── stage/              # Stage environment overlay
    │   ├── kustomization.yaml
    │   ├── deployment-patch.yaml
    │   └── ingress-patch.yaml
    └── prod/               # Production environment overlay
        ├── kustomization.yaml
        ├── deployment-patch.yaml
        └── ingress-patch.yaml
```

## Environments

### Stage
- **Domain**: `stg.ciyex.com/api`
- **Replicas**: 1
- **Spring Profile**: stage

### Production
- **Domain**: `app.ciyex.com/api`
- **Replicas**: 2
- **Spring Profile**: prod

## Deployment Commands

### Preview manifests (dry-run)

**Stage:**
```bash
kubectl kustomize k8s/overlays/stage
```

**Production:**
```bash
kubectl kustomize k8s/overlays/prod
```

### Deploy to cluster

**Stage:**
```bash
kubectl apply -k k8s/overlays/stage
```

**Production:**
```bash
kubectl apply -k k8s/overlays/prod
```

### Delete deployment

**Stage:**
```bash
kubectl delete -k k8s/overlays/stage
```

**Production:**
```bash
kubectl delete -k k8s/overlays/prod
```

## Customization

### Update Image

Before deploying, update the image in `k8s/base/deployment.yaml`:
```yaml
image: your-registry/ciyex-app:tag
```

Or use Kustomize's image transformer in the overlay's `kustomization.yaml`:
```yaml
images:
  - name: IMAGE_URL
    newName: your-registry/ciyex-app
    newTag: v1.0.0
```

### Environment Variables

Environment-specific variables are patched in each overlay's `deployment-patch.yaml`.

### Scaling

Adjust replicas in the overlay's `kustomization.yaml`:
```yaml
replicas:
  - name: ciyex-app
    count: 3
```
