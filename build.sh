echo Build rete-context-menu-plugin
mkdir -p temp
echo "mv file to compile the package (rete-context-menu-plugin package is not compiled)"
mv -f ./node_modules/rete-context-menu-plugin ./temp/rete-context-menu-plugin
cd temp
cd rete-context-menu-plugin
echo "[Execute] npm install"
npm install
echo "[Execute] npm run build"
npm run build
echo ---------------------------------------------
echo "[Execute] npm run build:dev"
echo "[Execute:Hint] if it is stuck, press Ctrl+C and execute: mv -f ./temp/rete-context-menu-plugin ./node_modules/rete-context-menu-plugin"
echo ---------------------------------------------
npm run build:dev
cd ..
cd ..
echo try to move back the folder
mv -f ./temp/rete-context-menu-plugin ./node_modules/rete-context-menu-plugin
