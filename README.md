# Title Downloader

This is a super simple but very useful tool to download movies and tv shows from BR torrent servers. This is an alternative to Raddar or Sonarr once it doesn't have free BR torrent indexers.

## Run

To run this tool you just need two things: docker and [transmission](https://transmissionbt.com/).

Just type the following command into a terminal:

```bash
docker run -p 3149:3149 -d theryston/title-downloader

# If your transmission is running on the same internet network:
docker run --network="host" -d theryston/title-downloader
```

Now wait for about 1 minute that the server will start. Then open into your browser on: `http://<your-ip>:3149`.

Before you start using, click on the engine icon button and type your transmission host address, password and username (if your transmission doesn't require auth you don't need to add the password and username), then just click on "Salvar".

Now just: "Be happy!!!"

## Umbrel

If you're using on [Umbrel](https://umbrel.com/umbrelos) you need to open a file called `~/umbrel/app-data/transmission/docker-compose.yml` and then add `PROXY_AUTH_ADD: "false"` to `services.app_proxy.environment` like:

```bash
nano ~/umbrel/app-data/transmission/docker-compose.yml
```

![img](https://i.imgur.com/1Q1lT5D.png)

Remember to add http://localhost:9091 in "Endereço do transmission" NOT http://umbrel.local:9091
