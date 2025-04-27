import React, {useEffect, useState} from "react";
import {Button, Card, Dropdown, Empty, Image, List, Modal, Tag} from "antd";
import {appPrefix} from "@/constants";
import eventEmitter from "@/utils/eventEmitter.ts";
import PageDetail from "@/MainContent/PageDetail.tsx";
import {anyParams} from "@/types";
import storage from "@/storage.ts";
import {useDrop} from "react-dnd";
import {v4 as uuidV4} from "uuid";
import {MoreOutlined} from '@ant-design/icons';

interface PagesPropsType {
    collectionId: string;
    searchValue?: string
}

const Pages: React.FC<PagesPropsType> = (props) => {
    const {collectionId, searchValue = ''} = props;
    const [showPageDetail, setShowPageDetail] = useState(false);
    const [pageDetailData, setPageDetailData] = useState({} as anyParams);
    const [data, setData] = useState([] as any[]);
    const [{canDrop, isOver}, drop] = useDrop(() => ({
        accept: 'BOX',
        drop: async (item) => {
            console.log("dropItem",item)
            const cacheData = await storage.get(storage.PAGEDATA) || {};
            const pageData = cacheData[collectionId] || [];
            pageData.push({
                id: uuidV4(),
                name: item.title,
                description: item.title,
                url: item.url,
                favIconUrl: item.favIconUrl
            })
            cacheData[collectionId] = pageData;
            await storage.set("PageData", cacheData);
            setData(pageData)
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    }));
    const loadData = async () => {
        const cacheData = await storage.get(storage.PAGEDATA) || {};
        const pageData = cacheData[collectionId] || [];
        setData(pageData)
        return pageData;
    }

    useEffect(() => {
        loadData()
    }, [collectionId]);

    const onAddPage = () => {
        setPageDetailData({});
        setShowPageDetail(true)
    }
    useEffect(() => {
        eventEmitter.on("addPage" + collectionId, () => {
            onAddPage()
        })
    }, [collectionId]);

    const onClosePageDetail = () => {
        setShowPageDetail(false)
    }
    const renderItem = (item: any) => {
        const onClickItem = () => {
            window.open(item.url)
        }
        const onOperate = (data: any) => {
            data.domEvent.preventDefault();
            data.domEvent.stopPropagation();
            if (data.key === 'edit') {
                setPageDetailData(item)
                setShowPageDetail(true)
            } else if (data.key === 'delete') {
                Modal.confirm({
                    title: 'Confirm',
                    content: '请确认是否删除该页签？',
                    okText: '确认',
                    cancelText: '取消',
                    onOk: async () => {
                        const cacheData = await storage.get(storage.PAGEDATA) || {};
                        const pageData = cacheData[collectionId] || [];
                        cacheData[collectionId] = pageData.filter(item1 => item1.id !== item.id)
                        await storage.set("PageData", cacheData);
                        await loadData()
                    }
                })
            }
        }
        return (
            <Card
                className={`${appPrefix}-main-page-item`}
                key={item.id}
                title={<div className={`${appPrefix}-main-page-title`}>
                    <div className={`${appPrefix}-main-page-title-icon`}>
                        <Image src={item.favIconUrl} style={{width: 20, height: 20}} fallback={"/favicon.ico"}/>
                    </div>
                    <div className={`${appPrefix}-main-page-title-name`} title={item.name}>{item.name}</div>
                </div>}
                onClick={onClickItem}
                extra={<Dropdown menu={{
                    items: [
                        {
                            key: 'edit',
                            label: '编辑',
                        },
                        {
                            key: 'delete',
                            label: '删除',
                        }
                    ],
                    onClick: onOperate
                }}><MoreOutlined/></Dropdown>}
            >
                <div className={`${appPrefix}-main-page-item-description`}>
                    {item.description}
                </div>
            </Card>
        )
    }
    const isActive = canDrop && isOver;
    const dataSource = searchValue ? data.filter(item => item.name.includes(searchValue)) : data;
    return (
        <div ref={drop as any} className={`${appPrefix}-main-page ${isActive ? 'is-over' : ''}`}>
            {
                dataSource.length > 0 ? <List
                        className={`${appPrefix}-main-page-list`}
                        dataSource={dataSource}
                        renderItem={renderItem}/> :
                    <div style={{textAlign: "center"}}>
                        <div>没有收藏页签</div>
                    </div>
            }
            <PageDetail
                visible={showPageDetail}
                onClose={onClosePageDetail}
                onSave={loadData}
                data={pageDetailData}
                collectionId={collectionId}
            />
        </div>
    )
}
export default Pages;