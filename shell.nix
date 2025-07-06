{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  # Build tools (compile-time)
  nativeBuildInputs = [
    pkgs.deno
    pkgs.supabase-cli
  ];

  # Runtime libraries needed by your app (GTK, AppIndicator, etc.)
  buildInputs = [
  ];

  shellHook = ''
    export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath [
    ]}:$LD_LIBRARY_PATH

    echo "LD_LIBRARY_PATH set to $LD_LIBRARY_PATH"
  '';
}
