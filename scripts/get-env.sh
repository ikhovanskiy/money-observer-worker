TOKEN=$(yc lockbox payload get tinkoff-invest-api-token --key tinkoff-invest-api-token)

POSTGRESQL_PASSWORD=$(yc lockbox payload get connection-a59be58ssmbu9rjvj62g --key postgresql_password)
POSTGRESQL_HOST=$(yc lockbox payload get postgresql --key host)
POSTGRESQL_PORT=$(yc lockbox payload get postgresql --key port)
POSTGRESQL_DATABASE=$(yc lockbox payload get postgresql --key database)


if [ -z "${TOKEN}" ]; then
    echo "Ошибка: не удалось получить токен!" >&2
    exit 1
fi

echo "TOKEN=${TOKEN}" >> .env
echo "POSTGRESQL_PASSWORD=\"${POSTGRESQL_PASSWORD}\"" >> .env
echo "POSTGRESQL_HOST=\"${POSTGRESQL_HOST}\"" >> .env
echo "POSTGRESQL_PORT=\"${POSTGRESQL_PORT}\"" >> .env
echo "POSTGRESQL_DATABASE=\"${POSTGRESQL_DATABASE}\"" >> .env

if [ $? -eq 0 ]; then
    echo "Токен успешно записан в файл .env"
else
    echo "Ошибка записи токена в файл .env" >&2
    exit 1
fi

wget "https://storage.yandexcloud.net/cloud-certs/CA.pem" --output-document ./RootCA.pem