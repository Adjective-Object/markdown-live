let pkgs = import <nixpkgs> {};
in with pkgs; let
    devDependencies = [
    ];
    
    dependencies = [
      nodejs-7_x
    ];

in {
    devEnv = stdenv.mkDerivation {
        name = "lamina";
        buildInputs = devDependencies ++ dependencies;
    };
}

