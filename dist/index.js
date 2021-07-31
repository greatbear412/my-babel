import _intl from './src/intl';
import intl from 'intl2';
/**
 * App
 */

function App() {
  const title = _intl('_title');

  const desc = _intl('_descQqwe');
  const desc2 = `desc`;
  return <div id="app" className="app" title={_intl('_测试')} name={_intl('_qwe')}>
        <img src={Logo} />
        <h1>${title}</h1>
        <p>${desc}</p>  
        <div>
        {'中文'}

        {_intl('_ttttt')}
        </div>
      </div>;
}