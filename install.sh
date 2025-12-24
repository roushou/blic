#!/bin/bash
set -e

# Boune CLI Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/roushou/boune/main/install.sh | bash

REPO="roushou/boune"
BINARY_NAME="boune"
INSTALL_DIR="${BOUNE_INSTALL_DIR:-$HOME/.boune/bin}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${CYAN}$1${NC}"; }
success() { echo -e "${GREEN}$1${NC}"; }
warn() { echo -e "${YELLOW}$1${NC}"; }
error() { echo -e "${RED}$1${NC}"; }

detect_os() {
    case "$(uname -s)" in
        Linux*)     echo "linux" ;;
        Darwin*)    echo "darwin" ;;
        CYGWIN*|MINGW*|MSYS*) echo "windows" ;;
        *)          echo "unknown" ;;
    esac
}

detect_arch() {
    case "$(uname -m)" in
        x86_64|amd64)   echo "x64" ;;
        arm64|aarch64)  echo "arm64" ;;
        *)              echo "unknown" ;;
    esac
}

get_latest_version() {
    curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" 2>/dev/null | \
        grep '"tag_name":' | \
        sed -E 's/.*"cli-v([^"]+)".*/\1/' || echo ""
}

main() {
    echo ""
    info "Boune CLI Installer"
    echo ""

    OS=$(detect_os)
    ARCH=$(detect_arch)

    if [ "$OS" = "unknown" ]; then
        error "Unsupported operating system: $(uname -s)"
        echo "Supported: Linux, macOS, Windows (via WSL/MSYS)"
        exit 1
    fi

    if [ "$ARCH" = "unknown" ]; then
        error "Unsupported architecture: $(uname -m)"
        echo "Supported: x64 (x86_64), arm64 (aarch64)"
        exit 1
    fi

    # Construct artifact name
    if [ "$OS" = "windows" ]; then
        ARTIFACT="${BINARY_NAME}-${OS}-${ARCH}.exe"
    else
        ARTIFACT="${BINARY_NAME}-${OS}-${ARCH}"
    fi

    echo "  Platform: ${OS}-${ARCH}"

    # Get version
    VERSION="${1:-}"
    if [ -z "$VERSION" ]; then
        echo "  Fetching latest version..."
        VERSION=$(get_latest_version)
    fi

    if [ -z "$VERSION" ]; then
        error "Could not determine latest version"
        echo "Try specifying a version: curl ... | bash -s -- 0.1.0"
        exit 1
    fi

    echo "  Version:  ${VERSION}"
    echo ""

    # Create install directory
    mkdir -p "$INSTALL_DIR"

    # Download
    DOWNLOAD_URL="https://github.com/${REPO}/releases/download/cli-v${VERSION}/${ARTIFACT}"
    info "Downloading ${ARTIFACT}..."

    if command -v curl &> /dev/null; then
        HTTP_CODE=$(curl -fsSL -w "%{http_code}" "$DOWNLOAD_URL" -o "${INSTALL_DIR}/${BINARY_NAME}" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" != "200" ]; then
            error "Download failed (HTTP ${HTTP_CODE})"
            echo "URL: ${DOWNLOAD_URL}"
            exit 1
        fi
    elif command -v wget &> /dev/null; then
        if ! wget -q "$DOWNLOAD_URL" -O "${INSTALL_DIR}/${BINARY_NAME}" 2>/dev/null; then
            error "Download failed"
            echo "URL: ${DOWNLOAD_URL}"
            exit 1
        fi
    else
        error "curl or wget is required"
        exit 1
    fi

    # Make executable
    chmod +x "${INSTALL_DIR}/${BINARY_NAME}"

    success "Installed to ${INSTALL_DIR}/${BINARY_NAME}"
    echo ""

    # Check PATH
    if [[ ":$PATH:" != *":${INSTALL_DIR}:"* ]]; then
        warn "Add to your PATH:"
        echo ""
        echo "  export PATH=\"\$PATH:${INSTALL_DIR}\""
        echo ""
        echo "Add this line to ~/.bashrc, ~/.zshrc, or your shell profile."
        echo ""
    fi

    info "Run 'boune --help' to get started!"
    echo ""
}

main "$@"
