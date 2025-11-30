#!/bin/bash

DEBUG=${DEBUG:-0}   # if DEBUG=1, show logs

log() {
    [ "$DEBUG" -eq 1 ] && echo "[HEALTH] $1"
}

log "=== STARTING HEALTHCHECK ==="

# Detect network interface
IFACE=$(ls /sys/class/net | grep -E '^(eth|ens)' | head -n 1)
log "Detected interface: $IFACE"

check_online() {
    netstat -tnp 2>/dev/null | grep -q "earnapp"
    RET=$?
    log "Checking ESTABLISHED connections → $( [ $RET -eq 0 ] && echo 'ONLINE' || echo 'OFFLINE' )"
    return $RET
}

# 1) Main test
if check_online; then
    log "EarnApp is working normally."
    exit 0
fi

log "No active connections found. Renewing DHCP lease..."

# 2) Renew DHCP
dhclient -r $IFACE >/dev/null 2>&1
dhclient $IFACE >/dev/null 2>&1
sleep 8

if check_online; then
    log "Connection restored after DHCP renewal."
    exit 0
fi

log "Still offline. Restarting EarnApp service..."

# 3) Restart EarnApp
systemctl restart earnapp >/dev/null 2>&1
sleep 10

if check_online; then
    log "EarnApp recovered after service restart."
    exit 0
fi

log "All attempts failed. Rebooting system..."
reboot
