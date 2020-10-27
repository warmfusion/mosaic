# kubetpl:syntax:$

apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: mosaic
  annotations:
    cert-manager.io/cluster-issuer: futureplc-engineering-multicluster-dns-issuer
    certmanager.k8s.io/cluster-issuer: futureplc-engineering-multicluster-dns-issuer
spec:
  rules:
  - host: $DOMAIN.$CLUSTER.futureplc.engineering
    http:
      paths:
      - backend:
          serviceName: mosaic
          servicePort: 80
  - host: mosaic.futuretech.tools
    http:
      paths:
      - backend:
          serviceName: mosaic
          servicePort: 80
 tls:
 - hosts:
   - mosaic.futuretech.tools
   secretName: mosaic-certificate