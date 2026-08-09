#!/bin/bash

echo "========================================="
echo "  KREYE TOUT PAJ 100PANIK"
echo "========================================="

# Fonksyon pou kreye yon paj ak kontni debaz
create_page() {
    local filename=$1
    local title=$2
    echo "Kreye $filename..."
    touch "pages/$filename"
    echo "✅ $filename kreye"
}

# Kreye tout paj yo
cd pages

create_page "index.html" "Dakèy"
create_page "boutik.html" "Boutik"
create_page "produi.html" "Pwodwi"
create_page "koleksyon.html" "Koleksyon"
create_page "istwa.html" "Istwa"
create_page "kontak.html" "Kontak"
create_page "konekte.html" "Konekte"
create_page "enskri.html" "Enskri"
create_page "panye.html" "Panye"
create_page "checkout.html" "Checkout"
create_page "kont-mwen.html" "Kont Mwen"
create_page "admin.html" "Admin"
create_page "404.html" "404"

echo ""
echo "========================================="
echo "  TOUT PAJ YO KREYE!"
echo "========================================="
ls -la
