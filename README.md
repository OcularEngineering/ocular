# AutoflowAi

Run Apps-Server and CoreUi
```
nx run-many --target=serve --projects=apps-server,core-ui
```

Generate a New App To AppStore 
```
nx g @nx/react:remote example-app --directory=packages/apps/example-app
```

Publish New App
```
cd packages/apps/example-app
nx publish
```

Refresh your browser , you should see your new plugin :)


