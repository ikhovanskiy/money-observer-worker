TOKEN=$(yc lockbox payload get tinkoff-invest-api-token --key tinkoff-invest-api-token)

if [ -z "${TOKEN}" ]; then
    echo "Ошибка: не удалось получить токен!" >&2
    exit 1
fi

echo "TOKEN=${TOKEN}" >> .env

if [ $? -eq 0 ]; then
    echo "Токен успешно записан в файл .env"
else
    echo "Ошибка записи токена в файл .env" >&2
    exit 1
fi