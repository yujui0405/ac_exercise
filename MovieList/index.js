const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'  //後面會套movie的id
const POSTER_URL = BASE_URL + '/posters/' //後面會套圖片的亂碼
const MOVIES_PER_PAGE = 12

const movies = []
//儲存符合篩選條件的項目
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    //title ,image
    rawHTML += `
            <div class="col-sm-3">
                <div class="mb-2">
                    <div class="card">
                        <img src="${POSTER_URL + item.image}"
                            class="card-img-top" alt="Movie Poster">
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                        </div>
                    </div>
                </div>
            </div>`
  })

  dataPanel.innerHTML = rawHTML
}

//分頁器頁數
function renderPaginator(amount) {
  //無條件進位 如果有多的電影會加一頁
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

//根據頁數回傳要展示的陣列內容
function getMoviesByPage(page) {
  //movies ? "movies" : "filteredMovies"
  const data = filteredMovies.length ? filteredMovies : movies
  //page 1 ->movies 0-11
  //page 2 ->movies 12-23
  //page 3 ->movies 24-35
  //...
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    //response.data.results
    console.log(response)
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fuid"> `
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] //如果有字串轉陣列，如果沒有就給我空陣列 
  const movie = movies.find(movie => movie.id === id) //將點選的more id和movie陣列做比對，依樣的話就將物件放入新的陣列清單內
  if (list.some((movie => movie.id === id))) {
    //檢查是否有重複電影，有的話就return，就不加入到list內
    return alert('此電影已在收藏清單中')
  }
  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))//將綁定的id傳入 讓資料從電影+ID的URL傳回資料
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//分頁點擊事件
paginator.addEventListener('click', function OnPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return // A = <a></a>
  const page = Number(event.target.dataset.page)
  //重新渲染頁面(會先到getMoviesByPage切割要顯示的movies陣列)
  renderMovieList(getMoviesByPage(page))
})

//表單送出事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()

  //map, filter, reduce
  //條件篩選
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  //重新輸出至畫面
  if (filteredMovies.length === 0) {
    return alert('cannot find movie with keyword: ' + keyword)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
}).catch((error) => {
  console.log(error)
})
