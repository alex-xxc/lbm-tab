import {appPrefix} from "@/constants";
import {Button, Collapse, Empty, Input, Modal} from "antd";
import {
    DownOutlined,
    EditOutlined,
    SearchOutlined,
    UpOutlined,
    PlusOutlined,
    MinusOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';
import '@/style/main.scss';
import {inject, observer} from "mobx-react";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import storage from "@/storage.ts";
import {MainContentPropsType} from "@/MainContent/types.ts";
import CollectionDetail from "@/MainContent/CollectionDetail.tsx";
import {anyParams} from "@/types";
import Pages from "@/MainContent/Pages.tsx";
import eventEmitter from "@/utils/eventEmitter.ts";

const Index: React.FC<MainContentPropsType> = (props) => {
    const {selectSpace} = props.appStore;
    const spaceId = selectSpace?.[0]||'';
    const [collectionData, setCollectionData] = useState([]);

    const [collectionInfo, setCollectionInfo] = useState({} as anyParams)
    const [showCollectionDialog, setShowCollectionDialog] = useState(false)
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [searchValue, setSearchValue] = useState('');

    const loadCollectionData = useCallback(async () => {
        const cacheData = await storage.get(storage.COLLECTIONDATA);
        const collectionData = cacheData?.[spaceId] || [];
        setExpandedKeys(collectionData.map(item=>item.id))
        setCollectionData(collectionData)
        return collectionData;
    }, [spaceId])
    useEffect(() => {
        loadCollectionData()
    }, [spaceId]);

    const onAddCollection = useCallback(() => {
        setCollectionInfo({});
        setShowCollectionDialog(true)
    }, [])

    const onCloseCollectionDialog = useCallback(() => {
        setShowCollectionDialog(false)
    }, [])

    const getCollectionExtra = useCallback((item) => {
        const onEdit = (e:React.MouseEvent)=>{
            e.preventDefault();
            e.stopPropagation();
            setCollectionInfo(item)
            setShowCollectionDialog(true)
        }
        const onAdd = (e:React.MouseEvent)=>{
            e.preventDefault();
            e.stopPropagation();
            eventEmitter.emit('addPage'+item.id);
        }
        const onDelete = async (e:React.MouseEvent)=>{
            e.preventDefault();
            e.stopPropagation();
            Modal.confirm({
                title: 'Confirm',
                content: '请确认是否删除该收藏集？',
                okText: '确认',
                cancelText: '取消',
                onOk: async () => {
                    const cacheData = await storage.get(storage.COLLECTIONDATA);
                    cacheData[spaceId] = cacheData[spaceId].filter(i=>i.id!==item.id);
                    setCollectionData(cacheData[spaceId])
                    await storage.set("collectionData", cacheData);
                },
            });
        }
        return <div>
            <Button icon={<EditOutlined />} title={'编辑收藏集'} onClick={onEdit} size={'small'} type={'link'}/>
            <Button icon={<MinusOutlined/>} title={'删除收藏集'} onClick={onDelete}  size={'small'} type={'link'}/>
            <Button icon={<PlusOutlined/>} title={'新建页签'} onClick={onAdd}  size={'small'} type={'link'}/>
        </div>
    }, [spaceId])

    const collectionItems = useMemo(() => {
        return collectionData.map(item => {
            return {
                key: item.id,
                label: item.name,
                extra: getCollectionExtra(item),
                forceRender: true,
                children: <Pages collectionId={item.id} searchValue={searchValue}/>,
            }
        })
    }, [collectionData,getCollectionExtra,searchValue])

    const onCollapse = useCallback(() => {
        setExpandedKeys([])
    }, [])
    const onExpand = useCallback(() => {
        setExpandedKeys(collectionData.map(item=>item.id))
    }, [collectionData])

    const onChangeSearch = useCallback(async (e)=>{
        const value = e.target.value;
        setSearchValue((value||'').trim())
    },[spaceId,loadCollectionData])
    return (
        <div className={`${appPrefix}-main`}>
            <div className={`${appPrefix}-main-header`}>
            <span>
                <Input placeholder="请输入页签名称" prefix={<SearchOutlined/>} onChange={ onChangeSearch}/>
            </span>
                <span>
                <Button icon={<DownOutlined/>} type={'link'} onClick={onExpand}>展开</Button>
            </span>
                <span>
                <Button icon={<UpOutlined/>} type={'link'} onClick={onCollapse}>折叠</Button>
            </span>
                <span>
                <Button type={'primary'} onClick={onAddCollection}>新增收藏集</Button>
            </span>
            </div>
            <div className={`${appPrefix}-main-content`} style={collectionData.length?{}:{display:'flex',justifyContent:'center',alignItems:'center'}}>

                {
                    collectionData.length ? (
                            <Collapse items={collectionItems} activeKey={expandedKeys} onChange={setExpandedKeys}/>
                        ) :
                        (
                            <Empty
                                description={
                                    <span>
                                    暂无收藏集，请先创建收藏集
                                 </span>
                                }
                            >
                                <Button type={'primary'} onClick={onAddCollection}>新建收藏集</Button>
                            </Empty>
                        )
                }
            </div>
            <CollectionDetail
                visible={showCollectionDialog}
                onClose={onCloseCollectionDialog}
                onSave={loadCollectionData}
                data={collectionInfo}
                spaceId={spaceId}
            />
        </div>
    )
}
export default inject("appStore")(observer(Index));



