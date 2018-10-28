const rp = require('request-promise');
const $ = require('cheerio');
const fs = require('fs');

const mainUrl = 'https://spb.hh.ru/search/vacancy';
const area = '1'; // SPb
const text = 'front+end'

const startUrl = `${mainUrl}?area=${area}&text=${text}`


rp(startUrl)
  .then(html => {

    const maxPage = getMaxPage(html)
    let listSalaries = []
    let promises = []

    for (let i = 0; i < maxPage; i++) {
      promises.push(rp(`${startUrl}&page=${i}`));
    }

    Promise.all(promises)
      .then(results => {
        results.forEach(item => {
          listSalaries.push(...getListSalaries(item))
        })

        fs.writeFile("salaries.txt", listSalaries, error => {
          console.log(error)
        })

      })
  })
  .catch(err => {
    console.log(err)
  })


const getMaxPage = html => {
  let dataPage = Object.values($('a[data-page]', html))
  let pages = []

  dataPage.forEach(item => {
    if (item.attribs) {
      pages.push(+item.attribs['data-page'])
    }
  })

  return Math.max(...pages)
}

const getListSalaries = (html) => {
  let salariesHtml = $('div.vacancy-serp-item__compensation', html)
  let salaries = []

  $(salariesHtml).each((index, element) => {
    salaries.push($(element).text())
  })

  return salaries
}