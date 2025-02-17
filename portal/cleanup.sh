#!/bin/bahs

# Absoluter Pfad zum Verzeichnis, das überprüft werden soll
TARGET_DIR="/Users/Admin/evaschiffmann/evaschiffmann.de Kopie"

# Überprüfen, ob das angegebene Verzeichnis existiert
if [ ! -d "$TARGET_DIR" ]; then
    echo "Das angegebene Verzeichnis existiert nicht: $TARGET_DIR"
    exit 1
fi

# Array zur Speicherung der Basisnamen von Dateien mit Query
base_names_with_query=()

# Durchlaufe alle Dateien im angegebenen Verzeichnis und Unterverzeichnisse
find "$TARGET_DIR" -type f | while read -r file; do
    # Prüfen, ob die Datei eine URL-Query enthält (Fragezeichen im Dateinamen)
    if echo "$file" | grep -q '?'; then
        # Extrahiere den Basisnamen ohne Query (Teil vor dem ersten Fragezeichen)
        base_name=$(echo "$file" | sed 's/\?.*//')

        # Wenn noch keine Datei mit diesem Basisnamen und einer Query gefunden wurde, behalte sie
        if [[ ! " ${base_names_with_query[@]} " =~ " $base_name " ]]; then
            base_names_with_query+=("$base_name")
            echo "Behalte Datei mit Query: $file"
        else
            # Lösche alle weiteren Dateien mit der gleichen Basis und einer Query
            echo "Lösche Datei mit Query: $file"
            rm "$file"
        fi
    else
        # Behalte alle Dateien ohne Query
        echo "Behalte Datei ohne Query: $file"
    fi
done