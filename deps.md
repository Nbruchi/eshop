kafka provider

ws
@tensorflow/tfjs-node

patch-package --dev
postinstall-postinstall --dev

<!-- Common command -->
npx nx g @nx/express:app logger-service --directory=apps/logger-service --e2eTestRunner=none

npx patch-package @tensorflow/tfjs-node

<!-- Missing features -->
- Seller/User chatting
- Logging
- UI Management (Chaging logo,banner, etc)