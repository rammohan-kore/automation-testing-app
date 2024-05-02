# automation-testing-app

This application was created with the [create-jambonz-ws-api](https://www.npmjs.com/package/create-jambonz-ws-app) command.  This documentation was generated at the time when the project was generated and describes the functionality that was initially scaffolded.  Of course, you should feel free to modify or replace this documentation as you build out your own logic.

## Services

Based on the options that you have chosen, this application exposes the following services over a websocket interface:

### /hello-world
A simple "hello, world" application using text to speech.


# define the below routes in /etc/nginx/sites-enabled/ssl file
location /avt-server/socket.io/ {
      proxy_pass http://localhost:3100;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
    location /automationvoicetesting/ {
            rewrite ^/automationvoicetesting/(.*) /$1  break;
            proxy_pass http://localhost:3400;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
     }




server {
  listen 443 ssl;
  include snippets/korevg.conf;
  server_name audiovoicetesting-listener;
  location / {
    proxy_pass http://localhost:3400;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    auth_basic "Secured Endpoint";
    auth_basic_user_file /etc/nginx/.htpasswd;
  }
}

server {
  listen 443 ssl;
  include snippets/korevg.conf;
  server_name avt-ws-listener.ai;
  location / {
    proxy_pass http://localhost:3100;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    auth_basic "Secured Endpoint";
    auth_basic_user_file /etc/nginx/.htpasswd;
  }
}
