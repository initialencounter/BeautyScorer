# BeautyScorer
AutoJsPro颜值打分器

导入requests模块
```
pip install requests
```
在server.py 
添加
```
import requests
```
将路由'predict'下的
```
image = request.files.get("image").read()
```
改为
```
url = request.json.get("image")
image = requests.get(url,headers={'responseType': 'arraybuffer'}
```
