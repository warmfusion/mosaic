FROM nginx:1.19.3

LABEL Name="Mosaic" \
      Version="2.0" \
      Owner="Engineering"


COPY assets /usr/share/nginx/html/assets
COPY healthz /usr/share/nginx/html/
COPY bower_components /usr/share/nginx/html/bower_components
COPY index.html /usr/share/nginx/html/


COPY boxtemplate.html /usr/share/nginx/html/
COPY src /usr/share/nginx/html/src
