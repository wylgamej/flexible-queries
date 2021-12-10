/*                 yarn dev в консоли - запуск программы                     */
/*                 Ctrl + S - перезапуск программы                           */

// Импортирую express - для создания локального сервера;
import express, { Router } from 'express';
// Импортирую ADODB - это библиотека для работы с Access базами данных;
import ADODB from 'node-adodb';


// Записываю в app функцию express();
const app = express();
const router = Router();
// Подключаю базу данных из файла Source=<name>.mdb, файл находится в папке проекта;
const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=jumise.mdb;');
// Инициализирую пустой массив, в который буду заносить записи удовлетворяющие условию запроса;
let result = [];

// Функция для сортировки массива объектов по одному из полей объектов;
Array.prototype.sortBy = function(p) {
    return this.slice(0).sort(function(a,b) {
      return (a[p] < b[p]) ? 1 : (a[p] > b[p]) ? -1 : 0;
    });
  }

// Симметричная трапецивидная функция, принимает параметры: x - искомое значение с которым работаем; b, c - ограничения функции;
// d - шаг гибкости;
function tmf(x, b, c, d) {
    return Math.round(Math.max( 0, Math.min( 1, (Math.min( x-b,c-x )+d)/d ) )*100)/100;
}

// Функция получения всех записей удовлетворяющих условию гибкого запроса;
async function search(query, b, c, d) {
    await connection.query(query).then(async (data) => {
        for(let i = 0; i < data.length; i++) {
            // В записи data[i].<name> - необходимо указать название аттрибута, по которому происходит поиск;
            if(tmf(data[i].Стаж, b, c, d) > 0) {
                // В записи data[i].<name> - необходимо указать название аттрибута, по которому происходит поиск;
                data[i].tmf = tmf(data[i].Стаж, b, c, d);
                result.push(data[i]);
            };
        }
    });

    let labels = [];
    for (let j = 0; j < c*2; j++) {
      await labels.push(j.toString());
    };

    let func = [];
    for (let k = 0; k < labels.length; k++) {
      func.push(await tmf(k, b, c, d));
    }
    
    const returned = {
      labels: labels,
      data: func,
      result: result.sortBy('tmf')
    }
    // Сортирую массив по полю tmf в объектах с помощью ранее описанной функции;
    return returned;
};

// Инициализируем наш запрос, сюда вписываем любой SQL запрос;
const query = 'SELECT * FROM Сотрудники';

// Вызываем функцию поиска записей задавая необходимые параметры:
// 1 - SQL Запрос;
// 2, 3 - Ограничения функции;
// 4 - Шаг гибкости;
let final = await search(query, 0, 10, 1);

console.log(final.result);

router.get('/', (req, res) => {
  res.cookie('labels', final.labels, { path: '/' });
  res.cookie('data', final.data, { path: '/' });
  res.cookie('workers', final.result, { path: '/'});
  res.sendFile('index.html', { root: '.' });
})

app.use(router);

app.listen(4000);
