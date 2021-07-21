console.log("filename: 1 0")
console.log(1);

function func() {
  console.log("filename: 4 4")
  console.info(2);
}

export default class Clazz {
  say() {
    console.log("filename: 9 8")
    console.debug(3);
  }

  render() {
    return <div>{[console.log("filename: 12 21"), console.error(4)]}</div>;
  }

}
let a = 1;
const b = a + 1;
a++;