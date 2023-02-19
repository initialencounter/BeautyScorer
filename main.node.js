"ui";

const ui = require('ui');
const fs = require('fs').promises;
const fr = require('fs').readFileSync;
const fw = require('fs').writeFileSync;
const path = require('path');

class WebActivity extends ui.Activity {
    get initialStatusBar() {
        return { color: '#ffffff', light: true };
    }

    get layoutXml() {
        return `
<vertical>
    <webview id="web" w="*" h="*"/>
</vertical>
        `
    }

    onContentViewSet(contentView) {
        this.webview = contentView.binding.web;
        this.initializeWebView(this.webview);
        logLocation(this.webview.jsBridge);
    }

    initializeWebView(webview) {
        webview.loadUrl(`file://${__dirname}/index.html`);
        // 监听WebView的控制台消息，打印到控制台
        webview.on('console_message', (event, msg) => {
            console.log(`${path.basename(msg.sourceId())}:${msg.lineNumber()}: ${msg.message()}`);
        });
        const jsBridge = webview.jsBridge;
        // 监听Web的listFiles请求，返回文件夹的文件列表
        jsBridge.handle('listFiles', async (event, args) => {
            console.log('...')
            const dir = args.path;
            const files = await fs.readdir(dir);
            const rateing = fr(`./rateing.txt`).toString()
            const count = rateing.split('\n').length
            const result = [];
            console.log(count)
            result.push({
                type: 'count', count:count
            });
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = await fs.stat(fullPath);
                result.push({
                    type: stat.isDirectory() ? 'dir' : 'file',
                    name: stat.isDirectory() ? file + '/' : file,
                    path: fullPath
                });
            }
            //console.log(result)
            return result;
        });
        // 监听Web的finish请求，销毁界面
        jsBridge.handle('finish', () => {
            this.finish();
        });
        jsBridge.handle('post', async(event,args) => {
            fw('./rateing.txt',args.pretty_value+',\n',{flag:'a'})
            return 'success'
        });
        
    }

    // 监听Activity的返回事件
    onBackPressed() {
        // 不调用super.onBackPressed()，避免返回时销毁界面
        // 通知web返回上一级目录
        this.webview.jsBridge.invoke('go-back').then((dir) => console.log(`go back to ${dir}`));
    }
}
ui.setMainActivity(WebActivity);

async function logLocation(jsBridge) {
    const href = await jsBridge.eval("window.location.href");
    console.log(decodeURI(href));
}