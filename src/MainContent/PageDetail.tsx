import {PageDetailPropsType} from "@/MainContent/types.ts";
import React, {useCallback, useEffect, useState} from "react";
import {Form, Input, Modal, TreeSelect} from "antd";
import storage from "@/storage.ts";
import {v4 as uuidV4} from "uuid";
import {inject, observer} from "mobx-react";
import eventEmitter from "@/utils/eventEmitter.ts";

const PageDetail:React.FC<PageDetailPropsType> = (props) => {
    const {selectSpace} = props.appStore!;
    const {data, collectionId} = props;
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [spaces, setSpaces] = useState([]);
    const [collections, setCollections] = useState([]);
    const spaceId = selectSpace?.[0]||'';
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

        const collectionData = await storage.get(storage.COLLECTIONDATA, spaceId);
        replaceData(collectionData);
        setCollections(collectionData);
    }

    useEffect(() => {
        if(props.visible && props.visible!==visible){
            setVisible(true)
            form.resetFields();
            form.setFieldsValue({
                ...props.data,
                collection: collectionId,
                space: spaceId
            });
            getTreeData()
        }
    }, [props.visible, visible, form, props.data, spaceId]);

    const onSave = useCallback(async ()=>{
        const {errorFields=[]} = await form.validateFields()
        if(errorFields.length){
            return;
        }
        const {name, description, url, collection} = form.getFieldsValue();
        let pageData = await storage.get(storage.PAGEDATA, collection) || [];
        let needUpdateNewId = '';
        if(data?.id){
            if(collection===collectionId){
                pageData = pageData.map(item=>{
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
                pageData = [...pageData, {...data, name, description, url}]
                needUpdateNewId = collection;
                let newPageData = await storage.get(storage.PAGEDATA, collectionId) || [];
                newPageData = newPageData.filter(item=>item.id!==data.id)
                await storage.set([storage.PAGEDATA, collectionId], newPageData);
            }

        }else {
            pageData = [...pageData, {id:uuidV4(), name, description, url}]
        }
        await storage.set([storage.PAGEDATA, collection], pageData);
        if(needUpdateNewId){
            eventEmitter.emit("loadPage"+needUpdateNewId);
        }
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
            const currentCollections = await storage.get(storage.COLLECTIONDATA, spaceId)||[];
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
                name="PageDetail"
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
export default inject("appStore")(observer(PageDetail));