/*                 yarn dev в консоли - запуск программы                     */
/*                 Ctrl + S - перезапуск программы                           */

// Импортирую express - для создания локального сервера
import express from 'express';
// Импортирую ADODB - это библиотека для работы с Access базами данных
import ADODB from 'node-adodb';

// Записываю в app функцию express()
const app = express();
// Подключаю базу данных из файла Source=<name>.mdb, файл находится в папке проекта
const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=jumise.mdb;');
// Инициализирую пустой массив, в который буду заносить записи удовлетворяющие условию запроса
let result = [];

// Функция для сортировки массива объектов по одному из полей объектов
Array.prototype.sortBy = function(p) {
    return this.slice(0).sort(function(a,b) {
      return (a[p] < b[p]) ? 1 : (a[p] > b[p]) ? -1 : 0;
    });
  }

// Симметричная трапецивидная функция, принимает параметры x - искомое значение с которым работаем; b, c - ограничения функции;
// d - шаг гибкости
function tmf(x, b, c, d) {
    return Math.round(Math.max( 0, Math.min( 1, (Math.min( x-b,c-x )+d)/d ) )*100)/100;
}

// Функция получения всех записей удовлетворяющих условию гибкого запроса
async function search(query, b, c, d) {
    await connection.query(query).then(async (data) => {
        for(let i = 0; i < data.length; i++) {
            // В записи data[i].<name> - необходимо указать название аттрибута, по которому происходит поиск 
            if(tmf(data[i].Стаж, b, c, d) > 0) {
                // В записи data[i].<name> - необходимо указать название аттрибута, по которому происходит поиск
                data[i].tmf = tmf(data[i].Стаж, 12, 18, 6);
                result.push(data[i]);
            };
        }
    });

    // Сортирую массив по полю tmf в объектах с помощью ранее описанной функции
    return result.sortBy('tmf');
};

// Инициализируем наш запрос, сюда вписываем любой SQL запрос
const query = 'SELECT * FROM Сотрудники';

// Вызываем функцию поиска записей задавая необходимые параметры
// 1 - SQL Запрос
// 2, 3 - Ограничения функции
// 4 - Шаг гибкости
const final = await search(query, 12, 18, 2);

// Выводим результат в консоль
console.log(final);

// Поле tmf в объекте - степень удовлетворения условию запроса 1 - максимум

app.listen(4000);