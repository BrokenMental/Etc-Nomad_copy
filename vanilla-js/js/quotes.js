const quotes = [
    {
        quote: '아이들만이 자신이 무엇을 원하는지 안다.',
        author: '생택쥐페리'
    },
    {
        quote: '20대에 당신의 얼굴은 자연이 준 것이지만, 50대의 당신의 얼굴은 스스로 가치를 만들어야 한다.',
        author: '가브리엘(코코)샤넬'
    },
    {
        quote: '모든 사람은 죽음 앞에 평등하다.',
        author: '퍼블릴리어스 사이러스'
    },
    {
        quote: '아버지가 옳았다는 사실을 깨달을 무렵에는 자신에 반대하는 아들을 하나 쯤 두게 마련이다.',
        author: '찰스 워즈워드'
    },
    {
        quote: '충고는 거의 환영받지 못한다.',
        author: '체스터필드 경'
    }
]

const quote = document.querySelector('#quote span:first-child');
const author = document.querySelector('#quote span:last-child');

const todaysQuote = quotes[Math.floor(Math.random() * quotes.length)];

quote.innerText = todaysQuote.quote;
author.innerText = todaysQuote.author;