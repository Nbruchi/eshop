kafka provider

@tensorflow/tfjs-node

<!-- Common command -->
npx nx g @nx/express:app seller-service --directory=apps/seller-service --e2eTestRunner=none

npx patch-package @tensorflow/tfjs-node


<!-- Send log example -->
```ts
await sendLog({
    type: "success",
    message: `User purchased product ${user.email}`,
    source: "order-service"
})
```