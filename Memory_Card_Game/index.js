const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]
const view = {
  /* 0 - 12：黑桃 1 - 13
    13 - 25：愛心 1 - 13
    26 - 38：方塊 1 - 13
    39 - 51：梅花 1 - 13 */
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `
        <p>${number}</p>
        <img src="${symbol}" alt="">
        <p>${number}</p>
      `
  },
  //用於渲染卡片
  getCardElement(index) {
    return `
  <div class="card back" data-index="${index}">
  </div>
  `
  },

  //用於轉換 英文字母卡片
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    //生成52個元素的空陣列，再以此陣列的key來生成一陣列，之後將每一陣列元素個別生成一卡片，最後將陣列合併
    rootElement.innerHTML = indexes.map((index) => this.getCardElement(index)).join('')
  },

  //翻牌
  //flipCards(1,2,3,4,5)
  //cards = [1,2,3,4,5]
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        //回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      //回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })

  },

  //配對成功的話的樣式變化
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  //卡片邊框閃爍效果
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => {
        card.classList.remove('wrong')
      }, {
        once: true
      })
    })
  },

  //遊戲結束時的畫面
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
     <p>Complete!</p>
     <p>Score: ${model.score}</p>
     <p>You've tried: ${model.triedTimes} times</p>
    `

    const header = document.querySelector('#header')
    header.before(div)
  }
}

const utility = {
  //回傳打亂的陣列內容 洗牌演算法：Fisher-Yates Shuffle
  getRandomNumberArray(count) {
    //count = 5 => [2, 3, 4, 1, 0]
    const number = Array.from(Array(count).keys())
    //從最後一張開始到倒數第二張為止
    for (let index = number.length - 1; index > 0; index--) {
      //決定要跟前面的哪一張牌做交換
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

//資料
const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0
}

//狀態
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  //生成卡片
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)//計算嘗試的次數

        view.flipCards(card)
        model.revealedCards.push(card)

        //判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          //配對正確
          view.renderScore((model.score += 10))//分數+10

          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          //如果結束了
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000) //setTimeout 呼叫function
        }
        break
    }

    console.log('current state: ', this.currentState)
    console.log('revealed card', ...model.revealedCards)
  },

  //翻回配對錯誤的牌和重製model
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

controller.generateCards()

//node list
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})