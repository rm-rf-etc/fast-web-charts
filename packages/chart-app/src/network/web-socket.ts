import { Socket, Channel } from 'phoenix';

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "lib/web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "lib/web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/3" function
// in "lib/web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket, _connect_info) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end

function logMessage(...args: any[]) { console.log(...args) }
function logError(...args: any[]) { console.error(...args) }
function logInfo(...args: any[]) { console.info(...args) }
function logWarn(...args: any[]) { console.warn(...args) }

export class WebSocketService {
  socketPath = "/socket";
  channels = {};
  connected = false;
  sid = null;
  joined: Channel | null = null;
  socket: Socket | null = null;
  onConnectCallback: ((r?: any, o?: any) => void) | null = null;
  logMessage: any;
  logError: any;
  logInfo: any;
  logWarn: any;

  constructor(opts: any = {}) {
    this.logMessage = opts.logMessage || logMessage;
    this.logError = opts.logError || logError;
    this.logInfo = opts.logInfo || logInfo;
    this.logWarn = opts.logWarn || logWarn;
    if (opts.socketPath) this.socketPath = opts.socketPath;
  }

  connect(onConnect: CallableFunction) {
    this.socket = new Socket(this.socketPath);
    this.socket.connect();

    const lobbyChannel = this.socket.channel("lobby");
    lobbyChannel.join();
    lobbyChannel.on("sid", data => {
      this.sid = data.sid;
      lobbyChannel.leave();
      if (onConnect) onConnect(this);
    });

    this.socket.onOpen((...args: any[]) => this.onOpen(...args));
    this.socket.onClose((...args: any[]) => this.onClose(...args));
    return this;
  }

  onOpen(...args: any[]) {
    this.connected = true;
    this.logInfo("socket opened", ...args);
    if (this.onConnectCallback) this.onConnectCallback(this, ...args);
  }

  onClose(...args: any[]) {
    this.connected = false;
    this.logInfo("socket closed", ...args);
  }

  push(msg: string, payload: any) {
    if (!this.connected) throw "socket not connected";
    if (!this.joined) throw "no joined channel";
    return this.joined.push(msg, {sid: this.sid, ...payload});
  }

  on(event: string, handler: (...args: any[]) => void) {
    if (!this.connected) throw "socket not connected";
    if (!this.joined) throw "no joined channel";
    return this.joined.on(event, handler);
  }

  join(topic: string) {
    return new Promise((res, rej) => {
      if (!this.connected) {
        rej("can't join channel, socket is not connected");
      }
      if (!this.socket) {
        return null
      }
      const channel = this.socket.channel(topic, {sid: this.sid});

      channel
        .join()
        .receive("ok", (resp: any) => {
          this.logMessage("channel joined successfully", resp);
          Object.assign(this.channels, { [topic]: channel });
          this.joined = channel;
          res(channel);
        })
        .receive("error", (resp: any) => {
          rej(`channel join failed. ${JSON.stringify(resp)}`);
        });
    });
  }
}
