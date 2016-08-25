//cart中的数据
import * as types from '../constants/actions/cart';
const initialState = {
    main: {
        isFetching: 0,      //是否已经获取 
        didInvalidate: 1,   //是否失效
        itemArr:[],        //拆分出来的id
        itemObj:{},
        carts:[],
        carts_temp:[],
        _price:null,
        _count:null,
        _invalid:null,
        _quantity:null
    }
};
function itemInit (data){
    let itemArr = [];
    let itemObj = {};
    /*
        以上渲染的时候用，
        以下购物车逻辑处理
    */
    let carts = []; //表示选中的商品

    let carts_lose = []; // 失效商品

    let carts_temp = []; // 可以编辑的全部商品 id 用于全选

    let _count = 0; //表示购物车商品类型数量
    let _invalid = 0; //失效数量
    for (let i = 0; i < data.length; i++) {
        itemArr = [...itemArr,data[i].id];
        itemObj[data[i].id] = data[i];

        if (data[i].status) { //["status": 1]
            carts_lose = [...carts_lose,data[i].id]; //表示过期的商品
            _invalid++;
        } else {
            carts = [...carts,data[i].id]; //可编辑商品
            carts_temp = [...carts_temp,data[i].id];
        }
        _count++;
    }
    let { _price,_quantity } = sumCommon( carts,itemObj ); // 计算当前价格和数量
    return {itemArr,itemObj,carts,carts_lose,carts_temp,_price,_quantity,_invalid,_count};
}
function sumCommon(carts,itemObj){
    let _price = 0;
    let _quantity = 0;
    for (let i = 0; i < carts.length; i++) { //选中的商品
        _price += itemObj[carts[i]].price * itemObj[carts[i]].quantity;
        _quantity += itemObj[carts[i]].quantity;
    }
    _price = parseFloat(_price).toFixed(2); //保留两位；
    return {_price,_quantity};
}
function deleteCommon(itemArr,carts,carts_temp,carts_lose,_count,_invalid,id){
    if(!(id instanceof Array)){
        itemArr = itemArr.filter(value => value != id); // 过滤掉一样的值
        carts = carts.filter(value => value != id); // 过滤掉一样的值
        carts_temp = carts_temp.filter(value => value != id); // 过滤掉一样的值
        _count--;
    }else{
        let status = 0;
        let arr;
        if(carts_lose.join(';')==id.join(';')){//清空失效购物车
            status = 1;
            arr = carts_lose;
            _invalid=0;
        }else{//正常删除
            arr = carts;
        }
        for(let i=0;i<arr.length;i++){
            itemArr = itemArr.filter(value => value != arr[i]); // 过滤掉一样的值
            carts = carts.filter(value => value != arr[i]); // 过滤掉一样的值
            carts_temp = carts_temp.filter(value => value != arr[i]); // 过滤掉一样的值
            _count--;
        }
    }
    return {itemArr,carts,carts_temp,_count,_invalid};
}
export default function(state = initialState, action) {
    let newState, items, isTrue, carts, carts_temp,carts_lose, itemArr, id, sum , _count ,_invalid,deleteData,quantity;
    switch (action.type) {
        case types.CART_GET_MAIN + '_SUCCESS':
            if (state && state.didInvalidate == 0) { //当数据失效的时候，变为初始值；
                state.main = initialState.main;
            }
            items = itemInit(action.data.data);
            newState=Object.assign({}, state, {
                main: Object.assign({}, action.data, items,{isFetching:1,didInvalidate:1}),
            });
            return newState;
        case types.CART_GET_MAIN + '_ERROR':
            newState = Object.assign({}, state); //就是原数据，可以不写
            return newState;
        case types.CART_SELECT_MAIN:
            //选择
            newState = Object.assign({}, state);
            carts = newState.main.carts; // carts 选中的id数组
            carts_temp = newState.main.carts_temp; // carts 选中的id数组
            id = action.id; //当前操作的id
            if (id) { //单选
                isTrue = (carts).includes(id);
                if (isTrue) {
                    carts = carts.filter(value => value != id); // 过滤掉一样的值
                } else {
                    //carts.push(id);
                    carts = [...carts, id];
                }
            } else { //全选
                if (carts.length > 0) {
                    carts = [];
                } else {
                    carts = carts_temp;
                }
            }
            sum = sumCommon(carts, newState.main.itemObj);
            newState = Object.assign({}, state, {
                main: Object.assign({}, state.main, sum, {
                    carts
                }),
            });
            return newState;
        case types.CART_DELETE_MAIN + '_SUCCESS':
            //删除
            newState = Object.assign({}, state);
            carts = newState.main.carts; // carts 选中的id数组
            carts_temp = newState.main.carts_temp; // carts 选中的id数组
            carts_lose = newState.main.carts_lose; // carts_lose 失效
            itemArr = newState.main.itemArr; // 全部id数组
            _count = newState.main._count; // 全部id数组
            _invalid = newState.main._invalid;
            id = action.param.id;
            deleteData = deleteCommon(itemArr, carts, carts_temp, carts_lose, _count, _invalid, id);
            sum = sumCommon(deleteData.carts, newState.main.itemObj);
            newState = Object.assign({}, state, {
                main: Object.assign({}, state.main, sum, deleteData),
            });
            return newState;
        case types.CART_PUT_MAIN + '_SUCCESS':
            //更新数据
            newState = Object.assign({}, state);
            carts = newState.main.carts; // carts 选中的id数组
            id = action.param.id;
            quantity = action.param.quantity;
            newState.main.itemObj[id].quantity = quantity;

            sum = sumCommon(carts, newState.main.itemObj);

            newState = Object.assign({}, state, {
                main: Object.assign({}, state.main, sum)
            });
            return newState;
        case types.CART_POST_MAIN + '_SUCCESS':
            //结算；为了方便，暂时考虑是清空购物车数据
            return initialState;
        default:
            return state;
    }
};