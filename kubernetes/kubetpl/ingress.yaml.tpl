# kubetpl:syntax:$

apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: mosaic
spec:
  rules:
  - host: $DOMAIN.$CLUSTER.futureplc.engineering
    http:
      paths:
      - backend:
          serviceName: mosaic
          servicePort: 80
