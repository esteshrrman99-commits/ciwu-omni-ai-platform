#!/bin/bash
CIWU_DIR="$HOME/universal_env/apps/myai"
SCRIPTS_DIR="$CIWU_DIR/scripts"

while true; do
    echo ""
    echo "═══════════════════════════════════════════"
    echo "       🧠 SIS - SYSTEM INTEGRATION SUITE v2.0"
    echo "═══════════════════════════════════════════"
    echo "  1. CORTEX  - Expand Knowledge Base"
    echo "  2. CODEX   - Build Web Dashboard"
    echo "  3. VORTEX  - Add Voice Commands"
    echo "  4. ZORTEX  - Sync to Tablet"
    echo "  5. NERUTEX - Integrate with Other Apps"
    echo "  6. EONS    - Create Automated Backups"
    echo "  A. Run ALL Modules"
    echo "  Q. Quit"
    echo "═══════════════════════════════════════════"
    read -p "Option [1-6,A,Q]: " opt
    echo ""

    case $opt in
        1) bash "$SCRIPTS_DIR/module-cortex.sh" ;;
        2) bash "$SCRIPTS_DIR/module-codex.sh" ;;
        3) bash "$SCRIPTS_DIR/module-vortex.sh" ;;
        4) bash "$SCRIPTS_DIR/module-zortex.sh" ;;
        5) bash "$SCRIPTS_DIR/module-nerutex.sh" ;;
        6) bash "$SCRIPTS_DIR/module-eons.sh" ;;
        A|a)
            echo "🚀 Running ALL modules..."
            bash "$SCRIPTS_DIR/module-cortex.sh"
            bash "$SCRIPTS_DIR/module-codex.sh"
            bash "$SCRIPTS_DIR/module-vortex.sh"
            bash "$SCRIPTS_DIR/module-zortex.sh"
            bash "$SCRIPTS_DIR/module-nerutex.sh"
            bash "$SCRIPTS_DIR/module-eons.sh"
            echo ""
            echo "✅ ALL MODULES COMPLETE!"
            ;;
        Q|q) echo "Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid option. Try again." ;;
    esac

    echo ""
    read -p "Press Enter to continue..."
done
