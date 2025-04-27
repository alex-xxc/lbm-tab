import {appPrefix} from "@/constants";
import {Button, Form, Input, Modal, Tree} from "antd";
import '@/style/left.scss';
import {PlusCircleOutlined,PlusOutlined,MinusOutlined, FolderOutlined, EditOutlined} from '@ant-design/icons';
import React, {useEffect, useState} from "react";
import storage from "@/storage.ts";
import {inject, observer} from "mobx-react";
import eventEmitter from "@/utils/eventEmitter.ts";
import {anyParams, LeftPropsType} from "@/types";
import SpaceDetail from "@/Left/SpaceDetail.tsx";
const flatTree = (spaces: any[]): any[] => {
    return spaces.reduce((acc: any[], item: any) => {
        acc.push({...item,children: []});
        if (item.children && item.children.length > 0) {
            acc.push(...flatTree(item.children));
        }
        return acc;
    }, []);
};
const Index: React.FC<LeftPropsType> = (props) => {
    const {selectSpace, setProperty} = props.appStore;
    const [showAddSpace, setShowAddSpace] = useState(false);
    const [form] = Form.useForm();
    const [spaces, setSpaces] = useState([] as never[]);
    const [editSpaceInfo, setEditSpaceInfo] = useState({} as anyParams)
    const [searchValue, setSearchValue] = useState('');
    const [expandedKeys, setExpandedKeys] = useState([]);
    const getSpaces = async () => {
        const spaces = await storage.get(storage.SPACE);
        return spaces || [];
    };

    useEffect(() => {
        (async ()=>{
            const spaces = await getSpaces();
            setSpaces(spaces)
            const cacheSelectSpace = await storage.get(storage.SELECTSPACE)
            const selectSpaceId = cacheSelectSpace?.[0]||'';
            let existSpaceId = false;
            const spaceIds = [];
            function findSpaceIds (datas:any[]){
                datas.forEach(item=>{
                    if(!existSpaceId && item.id===selectSpaceId) existSpaceId = true;
                    if(item.children?.length){
                        spaceIds.push(item.id)
                        findSpaceIds(item.children)
                    }
                })
            }
            findSpaceIds(spaces)
            setExpandedKeys(spaceIds);
            if(existSpaceId){
                setProperty({selectSpace:cacheSelectSpace})
            }
        })()
        eventEmitter.on("addSpace", ()=>{
            setShowAddSpace(true)
            setEditSpaceInfo({})
        })
    }, []);

    const onAddSpace = () => {
        form.resetFields();
        setShowAddSpace(true)
        setEditSpaceInfo({})
    };

    const onCloseSpace = () => {
        setShowAddSpace(false)
    };
    const onSaveSpace = async (data:anyParams) => {
        const {space} = data;
        const spaces = await getSpaces();
        setSpaces(spaces)
        if(space){
            function findParent(datas:any[], parentIds:any[]){
                datas.forEach(item=>{
                    if(item.id===space){
                        setExpandedKeys(Array.from(new Set([...expandedKeys,...parentIds, item.id])))
                    }else if(item.children?.length){
                        findParent(item.children, [...parentIds, item.id])
                    }
                })
            }
            findParent(spaces, [])
        }
    };
    const onSelectTree = (keys) => {
        if(keys.length){
            setProperty({selectSpace: keys})
            storage.set('selectSpace', keys)
        }
    };

    const deleteSpace = async (id)=>{
        Modal.confirm({
            title: 'Confirm',
            content: '请确认是否删除该工作空间？',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                let spaces = await getSpaces();

                let deleteSpaceItem:any = null;
                const deleteSpace = (datas:any[])=>{
                    if(deleteSpaceItem) return datas;
                    if(datas.find(item=>item.id===id)){
                        return datas.filter(item=>{
                            if(item.id===id) deleteSpaceItem = item;
                            return item.id!==id
                        })
                    }
                    return datas.map(item=>{
                        if(item.children?.length){
                            item.children = deleteSpace(item.children)
                        }
                        return item;
                    })
                }
                spaces = deleteSpace(spaces);
                setSpaces(spaces)
                await storage.set("space", spaces)
                const deleteSpaceIds = [];
                const getSpaceIds = (datas:any)=>{
                    if(!Array.isArray(datas)){
                        datas = [datas];
                    }
                    datas.forEach(item=>{
                        deleteSpaceIds.push(item.id);
                        if(item?.children?.length) getSpaceIds(item.children)
                    })
                }
                getSpaceIds(deleteSpaceItem);
                if(selectSpace?.[0] && deleteSpaceIds.includes(selectSpace?.[0])){
                    const newSelectSpaceId = spaces?.[0]?.id||'';
                    const newSelectSpace = newSelectSpaceId?[newSelectSpaceId]:[];
                    setProperty({selectSpace:newSelectSpace});
                    storage.set('selectSpace', newSelectSpace)
                    
                }
                const collectionData = await storage.get(storage.COLLECTIONDATA)|| {};
                let deleteCollectionIds = [];
                deleteSpaceIds.forEach(item=>{
                    deleteCollectionIds = [...deleteCollectionIds,...(collectionData[item]||[]).map(item=>item.id)];
                    delete collectionData[item]
                })
                await storage.set(storage.COLLECTIONDATA, collectionData)
                const pageData = await storage.get(storage.PAGEDATA) || {};
                deleteCollectionIds.forEach(item=>{
                    delete pageData[item]
                })
                await storage.set("PageData", pageData)
            }
        })
    }

    const renderSpaces = (datas)=>{
        return datas.map(item=>{
            item.key = item.id;
            const add = ()=>{
                setEditSpaceInfo({parentId:item.id})
                setShowAddSpace(true)
            }
            const edit = ()=>{
                setEditSpaceInfo(item)
                setShowAddSpace(true)
            }
            const del = async ()=>{
                await deleteSpace(item.id)
            }
            item.title = <div className={`${appPrefix}-left-tree-item`}>
                <div className={`${appPrefix}-left-tree-item-name`}>{item.name}</div>
                <div className={`${appPrefix}-left-tree-item-icon`}>
                    <Button icon={<EditOutlined />} title={'编辑工作空间'} onClick={edit} size={'small'} type={'link'}/>
                    <Button icon={<PlusOutlined/>} title={'新建工作空间'} onClick={add}  size={'small'} type={'link'}/>
                    <Button icon={<MinusOutlined/>} title={'删除工作空间'} onClick={del}  size={'small'} type={'link'}/>
                </div>
            </div>;
            item.icon = <FolderOutlined />
            if(item.children?.length) {
                item.isLeaf = false
                item.children = renderSpaces(item.children)
            }else {
                item.isLeaf = true
            }
            return item;
        })
    }
    const onSearchChange = (e)=>{
        const value = e.target.value;
        setSearchValue((value||'').trim())
    }

    const onExpand = (expandedKeys)=>{
        setExpandedKeys(expandedKeys)
    }


    let dataSource = spaces;
    if(searchValue){
        dataSource = flatTree(spaces).filter((item:any)=>item.name.includes(searchValue));
    }

    return (
        <div className={`${appPrefix}-left`}>
            <div className={`${appPrefix}-left-title`}>
                <div className={`${appPrefix}-left-title-text`}>工作空间</div>
                <div className={`${appPrefix}-left-title-add`}>
                    <Button icon={<PlusCircleOutlined/>} title={'新建工作空间'} onClick={onAddSpace}/>
                </div>
            </div>
            <div className={`${appPrefix}-left-content`}>
                <div className={`${appPrefix}-left-content-search`}>
                    <Input placeholder="请输入工作空间名称" onChange={onSearchChange}/>
                </div>
                <div className={`${appPrefix}-left-tree`}>
                    <Tree
                        // onClick={onClick}
                        treeData={renderSpaces(dataSource)}
                        onSelect={onSelectTree}
                        selectedKeys={selectSpace}
                        showIcon
                        expandedKeys={expandedKeys}
                        onExpand={onExpand}
                    />
                </div>
            </div>

            <SpaceDetail visible={showAddSpace} onClose={onCloseSpace} onSave={onSaveSpace} data={editSpaceInfo}/>
        </div>
    )
        ;
};

export default inject("appStore")(observer(Index));