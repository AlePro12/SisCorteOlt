const Telnet = require('telnet-client');

class TelnetHuaweiUtilty {
    constructor(options) {
            this.options = options;
            this.level = options.level;
            this.Currentlevel = 1;
            this.debug = true;
            this.ip = options.ip;
            this.port = "23";
            this.username = options.user;
            this.password = options.pass;
            this.isConnected = false;
            this.connection = new Telnet();
            this.connection.on('ready', this.onReady.bind(this));
            this.connection.on('timeout', this.onTimeout.bind(this));
            this.connection.on('close', this.onClose.bind(this));
            this.params = {
                debug: this.debug,
                host: this.ip,
                port: 23,
                pageSeparator: "  --More ( Press 'Q' to quit )--",
                shellPrompt: /MA5683T>/i, // or negotiationMandatory: true,
                loginPrompt: />>User name[: ]*$/i,
                passwordPrompt: />>User password[: ]*$/i,
                failedLoginMatch: /The user name or password is invalid!/i,
                username: this.username,
                password: this.password,
                negotiationMandatory: false,
                timeout: 60000,
            }
        }
        // Events timeout, close, error, ready
    onTimeout() {
        this.isConnected = false;
        console.log("onTimeout");
    }
    onClose() {
        this.isConnected = false;
        console.log("onClose");
    }
    async onReady() {
        console.log("onready");
        this.isConnected = true;
        console.log(this.level);
        this.Currentlevel = 1;
        this.Currentlevel = 2;
        console.log("Level 2");
        var result = await this.sendCommand("enable", "MA5683T#");
        console.log(result);
        console.log("Level 3");
        this.Currentlevel = 3;
        var result = await this.sendCommand("config", 'MA5683T(config)#');
        console.log(result);
    }
    async ShowList() {
        console.log("ShowList");
        if (this.Currentlevel == 3) {
            var res = await this.sendCommand("show ont info all", 'MA5683T(config)#');
            if (res.status) {
                return this.ParserShowList(res.response);
            } else {
                return res;
            }
        } else {
            return {
                error: "No se puede mostrar la lista de dispositivos, no esta en el modo de configuracion",
                status: false
            }
        }
    }

    async ParserShowList(data) {
        const input = ((data.replace(/(\-+)/g, "")).replace(/Total(.*)/g, "").replace(/ID(.*)\n+/g, "").replace(/  F\/S(.*)/i, "Interfaz,Puerto,ONT,SN,AdminStatus,RunState,Config,MM").replace(/\n          /i, "").replace(/(  )0/g, "0").replace(/( +\n)/g, "\n").replace(/( +)/g, ",").replace(/(\n+,)/g, "").replace(/mismatch/g, "Mismatsh").trim())
        console.log(input);
        return this.csvJSON(input);
    }
    async sendCommand(command, shellPrompt) {
        console.log("sendCommand");
        if (this.isConnected) {
            try {
                var response = await this.connection.exec(command, { shellPrompt: shellPrompt })
                if (this.debug) {
                    console.log(response)
                }
                return {
                    status: true,
                    response: response,
                    message: "Comando enviado correctamente"
                }
            } catch (error) {
                // handle the throw (timeout)
                if (this.debug) {
                    console.log(error)
                }
                return {
                    status: false,
                    error: error,
                    message: "No se pudo enviar el comando"
                }
            }
        } else {
            console.log("No se pudo enviar el comando");
            return {
                status: false,
                message: "No se pudo enviar el comando"
            }
        }
    }
    async EnterInterface(Interface) {
        //interface gpon 0/0
        console.log("EnterInteface");
        if (this.Currentlevel == 3) {
            var res = await this.sendCommand("interface gpon " + Interface, 'OLT(config-interface-gpon-' + Interface + ')#');
            if (res.status) {
                this.Currentlevel = 4;
                return true;
            } else {
                return false;
            }
        }
    }
    GetShellPrompt() {
        if (this.Currentlevel == 1) {
            return /MA5683T>/i;
        } else if (this.Currentlevel == 2) {
            return "MA5683T#";
        } else if (this.Currentlevel == 3) {
            return "MA5683T(config)#";
        }
        return "";
    }
    async Connect() {
        try {
            await this.connection.connect(this.params)
            return {
                status: true,
                message: "Connected"
            }
        } catch (error) {
            return {
                status: false,
                error: error,
                message: "Error connecting to Telnet"
            }
        }
    }
    csvJSON(csv) {
        var lines = csv.split("\n");
        var result = [];
        // NOTE: If your columns contain commas in their values, you'll need
        // to deal with those before doing the next step 
        // (you might convert them to &&& or something, then covert them back later)
        // jsfiddle showing the issue https://jsfiddle.net/
        var headers = lines[0].split(",");

        for (var i = 1; i < lines.length; i++) {

            var obj = {};
            var currentline = lines[i].split(",");

            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }

            result.push(obj);

        }

        //return result; //JavaScript object
        return JSON.stringify(result); //JSON
    }
    async Disconnect() {
        await this.connection.end();
    }


}

function OpenTelnetHuawei(options) {
    return new TelnetHuaweiUtilty(options)
}

module.exports = OpenTelnetHuawei