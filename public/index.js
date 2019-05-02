import EventSource from 'eventsource'
import rxlite from 'rx-lite'

document.addEventListener('DOMContentLoaded', () => {
  const ResultDiv = document.getElementById('result')
  const StartButton = document.getElementById('start')
  const EndButton = document.getElementById('end')
  const RXObservable = CreateESObservable('/sse')
  let Stream

  const Observable = RXObservable.map(x =>
    Object.assign({}, x, {
      data: JSON.parse(x.data),
    })
  ) //.filter(x => x.data.type === 'CRONJOB')

  StartButton.addEventListener('click', () => {
    Stream = Observable.subscribe(
      ({ data }) => (ResultDiv.innerText += `${data.type}: ${data.data}\n`),
      console.error.bind(console),
      console.warn.bind(console, '')
    )
  })

  EndButton.addEventListener('click', () => Stream && Stream.dispose())
})

function CreateESObservable(url) {
  const observable = rxlite.Observable.create(observer => {
    const eventSource = new EventSource(url)
    eventSource.onmessage = observer.onNext.bind(observer)
    eventSource.onerror = observer.onError.bind(observer)
    eventSource.addEventListener('DONE', a => {
      observer.onCompleted()
      eventSource.close()
    })

    return () => eventSource.close()
  })

  return observable
}
