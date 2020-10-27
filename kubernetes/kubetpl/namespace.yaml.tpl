# kubetpl:syntax:$

apiVersion: v1
kind: Namespace
metadata:
  annotations:
    app.futureplc.engineering/group: $CI_GROUP
    app.futureplc.engineering/project: $CI_PROJECT
  name: $NAMESPACE