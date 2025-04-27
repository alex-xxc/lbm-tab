import {PageDetailPropsType} from "@/MainContent/types.ts";
import React, {useCallback, useEffect, useState} from "react";
import {Form, Input, Modal, TreeSelect} from "antd";
import storage from "@/storage.ts";
import {v4 as uuidV4} from "uuid";

const PageDetail:React.FC<PageDetailPropsType> = (props) => {
    const {data, collectionId} = props;
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [spaces, setSpaces] = useState([]);
    const [collections, setCollections] = useState([]);

    const getTreeData = async ()=>{
        const spaces = await storage.get(storage.SPACE);
        function replaceData(datas:any[]){
            datas.forEach(item=>{
                item.key = item.id;
                item.title = item.name;
                item.value = item.id;
                if(item?.children?.length){
                    replaceData(item.children)
                }
            })
        }
        replaceData(spaces)
        setSpaces(spaces)
        let selectSpaceId ='';
        const collections = await storage.get(storage.COLLECTIONDATA);
        Object.keys(collections).forEach(key=>{
            if(!selectSpaceId && collections[key].find(item=>item.id===collectionId)){
                selectSpaceId = key;
                const currentCollections = collections[key];
                replaceData(currentCollections)
                setCollections(currentCollections)
                form.setFieldsValue({
                    space: selectSpaceId
                })
            }
        })
    }

    useEffect(() => {
        if(props.visible && props.visible!==visible){
            setVisible(true)
            form.resetFields();
            form.setFieldsValue({
                ...props.data,
                collection: collectionId
            });
            getTreeData()
        }
    }, [props.visible, visible, form, props.data]);

    const onSave = useCallback(async ()=>{
        const {errorFields=[]} = await form.validateFields()
        if(errorFields.length){
            return;
        }
        const {name, description, url, collection} = form.getFieldsValue();
        const cacheData = await storage.get(storage.PAGEDATA) || {};
        if(data?.id){
            if(collection===collectionId){
                cacheData[collectionId] = cacheData[collectionId].map(item=>{
                    if(item.id===data.id){
                        item = {
                            ...item,
                            name,
                            description,
                            url
                        }
                    }
                    return item;
                })
            }else {
                cacheData[collectionId] = cacheData[collectionId].filter(item=>item.id!==data.id)
                cacheData[collectionId] = [...(cacheData?.[collectionId]||[]), {...data, name, description, url}]
            }

        }else {
            cacheData[collectionId] = [...(cacheData?.[collectionId]||[]), {id:uuidV4(), name, description, url}]
        }
        await storage.set("PageData", cacheData);
        props.onSave();
        onClose();
    },[collectionId, props.onSave])

    const onClose = useCallback(()=>{
        props.onClose();
        setVisible(false)
    },[props.onClose])

    const onValuesChange = async (changedValues)=>{
        if(Object.keys(changedValues)[0]==='space'){
            const spaceId = changedValues.space;
            function replaceData(datas:any[]){
                datas.forEach(item=>{
                    item.key = item.id;
                    item.title = item.name;
                    item.value = item.id;
                    if(item?.children?.length){
                        replaceData(item.children)
                    }
                })
            }
            const collections = await storage.get(storage.COLLECTIONDATA);
            const currentCollections = collections[spaceId]||[];
            if(currentCollections.length){
                replaceData(currentCollections)
                setCollections(currentCollections)
                form.setFieldsValue({
                    collection: currentCollections[0].id
                })
            }else {
                setCollections([])
                form.setFieldsValue({
                    collection: ''
                })
            }

        }
    }
    return (
        <Modal
            title={`${data?.id?"编辑":"新建"}页签`}
            open={visible}
            onOk={onSave}
            onCancel={onClose}
        >
            <Form
                name="basic"
                labelCol={{span: 6}}
                wrapperCol={{span: 18}}
                style={{maxWidth: 600}}
                initialValues={{remember: true}}
                autoComplete="off"
                form={form}
                onValuesChange={onValuesChange}
            >
                <Form.Item
                    label="工作空间"
                    name="space"
                    rules={[{required: true, message: 'Please select space!'}]}
                >
                    <TreeSelect treeData={spaces} multiple={false} treeDefaultExpandAll/>
                </Form.Item>
                <Form.Item
                    label="收藏集"
                    name="collection"
                    rules={[{required: true, message: 'Please select collection!'}]}
                >
                    <TreeSelect treeData={collections} multiple={false} treeDefaultExpandAll/>
                </Form.Item>
                <Form.Item
                    label="页签名称"
                    name="name"
                    rules={[{required: true, message: '请输入页签名称'}]}
                >
                    <Input placeholder="请输入页签名称"/>
                </Form.Item>
                <Form.Item
                    label="描述"
                    name="description"
                >
                    <Input placeholder="请输入描述"/>
                </Form.Item>
                <Form.Item
                    label="链接"
                    name="url"
                    rules={[{required: true, message: '请输入链接'}]}
                >
                    <Input placeholder="请输入链接"/>
                </Form.Item>
            </Form>
        </Modal>
    )
}
export default PageDetail;