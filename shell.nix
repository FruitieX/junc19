with import <nixpkgs> {};
stdenv.mkDerivation rec {
  name = "junc19";

  # needed by node-gyp
  PYTHON = "${pkgs.python2}/bin/python";

  env = buildEnv { name = name; paths = buildInputs; };
  buildInputs = [
    nodejs-10_x
  ];
}
