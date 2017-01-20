class Observer {
    this._observers=[]

    add (observer){
      this._observers.push(observer)
    }

    remove (observer){
      this._observers = this._observers.filter(obs => { return obs != observer })
    }

    notify (obj){
      this._observers.forEach(observer => {
        observer.call(null,obj)
      })
    }
}

export default Observer
