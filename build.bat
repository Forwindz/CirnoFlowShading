@echo off
echo Build rete-context-menu-plugin
mkdir temp
echo move file to compile the package (rete-context-menu-plugin package is not compiled)
move /Y node_modules/rete-context-menu-plugin temp/rete-context-menu-plugin
cd temp
cd rete-context-menu-plugin
echo [Execute] npm install
call npm install
echo [Execute] npm run build
call npm run build
echo ---------------------------------------------
echo [Execute] npm run build:dev
echo [Execute:Hint] if it is stuck, press Ctrl+C, and input N to continue the script!
echo ---------------------------------------------
call npm run build:dev
cd ..
cd ..
echo try to move back the folder
move /Y temp/rete-context-menu-plugin node_modules/rete-context-menu-plugin
