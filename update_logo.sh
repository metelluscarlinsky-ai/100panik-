#!/bin/bash

# Nouvo kòd logo a
NEW_LOGO='<a href="index.html" class="logo" aria-label="100PANIK - Retounen ak dakèy"><img src="../assets/images/logo-100panik.png" alt="Logo 100PANIK" style="height: 45px; width: auto; filter: brightness(1.2);" onerror="this.style.display='\''none'\'';this.parentElement.innerHTML='\''<span class=logo-text>100<span class=gold>PANIK</span></span><span class=logo-dot></span>'\''"></a>'

# Ale nan repèrtwa pages
cd pages

# Lis tout fichye HTML yo
for file in *.html; do
    if [ -f "$file" ]; then
        echo "Mete ajou logo nan: $file"
        # Ranplase ansyen logo a ak nouvo a (sèvi ak sed)
        sed -i "s|<a href=\"index.html\" class=\"logo\"[^>]*>.*</a>|$NEW_LOGO|g" "$file"
        echo "✅ $file mete ajou"
    fi
done

echo ""
echo "========================================="
echo "  TOUT PAJ YO METE AJOU AK LOGO A!"
echo "========================================="
