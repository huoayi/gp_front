FROM node:18-alpine AS builder

LABEL maintainer="StarkSim<gooda159753@163.com>"

# make the 'src' folder the current working directory
WORKDIR /src
# copy 'package.json' to install dependencies
COPY ./* ./
COPY MP_verify_zIdsfxY0yMbfwIjO.txt ./
COPY MP_verify_MNsDU7asQUlCrOa7.txt ./
# create a Link for ARM64 building
# RUN mkdir /usr/local/sbin
# RUN ln -s /usr/local/bin/node /usr/local/sbin/node
# install dependencies
# RUN npm install -g npm@9.2.0
RUN yarn install
# copy files and folders to the current working directory (i.e. 'app' folder)
COPY . .
# build app for production with minification
RUN yarn run build:test


FROM nginx:alpine
## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# 更改 nginx.conf 配置
COPY ./default.conf /etc/nginx/conf.d/default.conf

# 将项目根目录下dist文件夹下的所有文件复制到镜像中 /usr/share/nginx/html/ 目录下
COPY --from=builder /src/dist/ /usr/share/nginx/html

COPY --from=builder /src/MP_verify_zIdsfxY0yMbfwIjO.txt /usr/share/nginx/html
COPY --from=builder /src/MP_verify_MNsDU7asQUlCrOa7.txt /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
