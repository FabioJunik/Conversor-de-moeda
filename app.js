const state =(()=>{
  let exchangeRate = {};

  return{
    getExchangeRate: ()=> exchangeRate,
    setExchangeRate: newExchangerate =>{
      if(!newExchangerate.conversion_rates){
        console.log('O objecto precisa ter uma propriedade convertion_rates');
        return
      }
      exchangeRate = newExchangerate;
      return exchangeRate;
    }
  }
})()


const currenciesEl = document.querySelector('[data-js="currencies-container"]');
const currencyOneEl = document.querySelector('[data-js="currency-one"]');
const currencyTwoEl = document.querySelector('[data-js="currency-two"]');
const convertedValueEl = document.querySelector('[data-js="converted-value"]');
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]');
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]');

// let exchangeRate = {};

const getUrl = currency => `https://v6.exchangerate-api.com/v6/8c607a4d18247c1f86547794/latest/${currency}`;

const getErroMessage = errorType =>({
  "unsupported-code": "A moeda não existe no nosso banco de dados",
  "malformed-request": "alguma parte da sua solicitação não Segue a estrutura mostrada acima.",
  "invalid-key": "Sua chave de API não é válida.",
  "inactive-account": "se seu endereço de e-mail não foi confirmado.",
  "quota-reached": "Sua conta atingiu o número de solicitações: permitidas pelo seu plano."
})[errorType] || 'Não foi possível obter as informações'

const showAlert = err =>{
    const div = document.createElement('div');
    const button = document.createElement('button');

    div.classList.add('alert','alert-warning','alert-dismissible','fade', 'show');
    div.setAttribute('role','alert');
    div.textContent = err.message;
   
    button.classList.add('btn-close');
    button.setAttribute('type','button');
    button.setAttribute('aria-label','Close');
    div.appendChild(button);  
    button.classList.add('btn-close');

    button.addEventListener('click', () => div.remove());

    currenciesEl.insertAdjacentElement('afterend',div);
};

const fetchExchangeRate = async url =>{
  try { 
    const response = await fetch (url)
    const exchangeRateData = await response.json();

    if(!response.ok){
      throw new Error('Sua conexão falhou. Não foi possível obter as informações')
    }

    if(exchangeRateData.result === 'error'){
      throw new Error (getErroMessage(exchangeRateData['error-type']))
    }

    return state.setExchangeRate(exchangeRateData);

  }catch (err){
    showAlert(err);
  }
}

const getOptions = (selectCurrency ,conversion_rates) =>{ 
  const setSelectedAttribute = currency => currency === selectCurrency ? 'selected' : '';
  return  Object.keys(conversion_rates)
  .map(currency => `<option ${setSelectedAttribute(currency)}>${currency}</option>`).join('');
}

const showInitialInfo = ({conversion_rates}) =>{
  currencyOneEl.innerHTML = getOptions('USD',conversion_rates);
  currencyTwoEl.innerHTML = getOptions('AOA',conversion_rates);  

  convertedValueEl.textContent = conversion_rates.AOA.toFixed(2);
  valuePrecisionEl.textContent = `1 USD = ${conversion_rates.AOA} AOA`;
}

const init = async ()=>{
  const url = getUrl('USD');
  const exchangeRate = await fetchExchangeRate(url);

  if(exchangeRate && exchangeRate.conversion_rates)
  {
    showInitialInfo(exchangeRate);
  }

}
const getMultipliedExchangeRate = conversion_rates =>{
  const currencyTwo = conversion_rates[currencyTwoEl.value];
  return (timesCurrencyOneEl.value * currencyTwo).toFixed(2);
}
const showUpdateRates = ({conversion_rates}) =>{
  const currencyTwo = conversion_rates[currencyTwoEl.value];
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
  valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${currencyTwo} ${currencyTwoEl.value} `;
};

timesCurrencyOneEl.addEventListener('input',e =>{
  const {conversion_rates} = state.getExchangeRate();
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
});


currencyTwoEl.addEventListener('input',()=>{
  const exchangeRate = state.getExchangeRate();
  showUpdateRates(exchangeRate);
});

currencyOneEl.addEventListener('input',async e=>{
  const url = getUrl(e.target.value);
  const exchangeRate = await fetchExchangeRate(url);
  showUpdateRates(exchangeRate);
})

init()
