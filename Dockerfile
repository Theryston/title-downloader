FROM node:20

RUN apt install curl
RUN echo "deb [signed-by=/usr/share/keyrings/valeriansaliou_sonic.gpg] https://packagecloud.io/valeriansaliou/sonic/debian/ bookworm main" > /etc/apt/sources.list.d/valeriansaliou_sonic.list
RUN curl -fsSL https://packagecloud.io/valeriansaliou/sonic/gpgkey | gpg --dearmor -o /usr/share/keyrings/valeriansaliou_sonic.gpg
RUN apt update
RUN apt install sonic
COPY ./config/sonic/config.cfg /etc/sonic.cfg

WORKDIR /app

COPY . .
RUN mkdir db
RUN chmod -R 777 db

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build
RUN pnpm prune --prod

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 3000

CMD ["/start.sh"]
