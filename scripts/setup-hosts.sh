#!/bin/bash

# /etc/hosts に開発環境ドメインを追加

echo "Adding development domains to /etc/hosts..."

# 既存エントリをチェック
if grep -q "app.localhost.adapt" /etc/hosts; then
    echo "Domains already exist in /etc/hosts"
else
    echo "127.0.0.1 app.localhost.adapt" | sudo tee -a /etc/hosts
    echo "127.0.0.1 admin.localhost.adapt" | sudo tee -a /etc/hosts
    echo "127.0.0.1 auth.localhost.adapt" | sudo tee -a /etc/hosts
    echo "Development domains added successfully!"
fi
