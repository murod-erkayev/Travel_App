// const arr1 = [1,2,3]
// const arr2 = [3, 4, 5];
// const result = [
//     ...arr1.filter((item) => !arr2.includes(item)), 
//     ...arr2.filter((item) => !arr1.includes(item))];
// console.log(result);

// const str1 = 'hello'
// const str2 = "world";
// const arr = [...str2]    
// const resul = []
// for(item  of str1){
//     if(arr.indexOf(item) !==-1){
//         resul.push(item)
//         arr.splice(arr.indexOf(item), 1)
//     }
// }
// console.log(resul.join(""));
const str = "hello world"
const arr = [...str]
console.log(arr);
  