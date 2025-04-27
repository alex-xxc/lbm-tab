import React, {useCallback, useEffect, useState} from "react";
import {CollectionDetailPropsType} from "@/MainContent/types.ts";
import {Form, Input, Modal, TreeSelect} from "antd";
import storage from "@/storage.ts";
import {v4 as uuidV4} from "uuid";

const CollectionDetail:React.FC<CollectionDetailPropsType> = (props) => {
    const {data, spaceId} = props;
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [spaces, setSpaces] = useState([]);

    const getTreeData = async ()=>{
        const spaces = await storage.get(storage.SPACE);
        function replaceSpaces(datas:any[]){
            datas.forEach(item=>{
                item.key = item.id;
                item.title = item.name;
                item.value = item.id;
                if(item?.children?.length){
                    replaceSpaces(item.children)
                }
            })
        }
        replaceSpaces(spaces)
        setSpaces(spaces)
    }

    useEffect(() => {
        if(props.visible && props.visible!==visible){
            setVisible(true)
            form.resetFields();
            form.setFieldsValue({
                ...props.data,
                space: spaceId
            })
            getTreeData();
        }
    }, [props.visible, visible, form, props.data, spaceId]);


    const onSave = useCallback(async ()=>{
        const {errorFields=[]} = await form.validateFields()
        if(errorFields.length){
            return;
        }
        const {name, space} = form.getFieldsValue();
        const cacheData = await storage.get(storage.COLLECTIONDATA) || {};
        if(data?.id){
            if(space===spaceId){
                cacheData[spaceId] = cacheData[spaceId].map(item=>{
                    if(item.id===data.id){
                        item.name = name;
                    }
                    return item;
                })
            }else {
                cacheData[spaceId] = cacheData[spaceId].filter(item=>item.id!==data.id)
                cacheData[space] = [...(cacheData?.[space]||[]), {...data, name}]
            }

        }else {
            cacheData[spaceId] = [...(cacheData?.[spaceId]||[]), {id:uuidV4(), name}]
        }
        await storage.set("collectionData", cacheData);
        props.onSave();
        onClose();
    },[spaceId, props.onSave, data])

    const onClose = useCallback(()=>{
        props.onClose();
        setVisible(false)
    },[props.onClose])
    return (
        <Modal
            title={`${data?.id?"编辑":"新建"}收藏集`}
            open={visible}
            onOk={onSave}
            onCancel={onClose}
        >
            <Form
                name="basic"
                labelCol={{span: 6}}
                wrapperCol={{span:18}}
                style={{maxWidth: 600}}
                initialValues={{remember: true}}
                autoComplete="off"
                form={form}
            >
                <Form.Item
                    label="工作空间"
                    name="space"
                >
                    <TreeSelect treeData={spaces} multiple={false} treeDefaultExpandAll/>
                </Form.Item>
                <Form.Item
                    label="收藏集名称"
                    name="name"
                    rules={[{required: true, message: '请输入收藏集名称'}]}
                >
                    <Input placeholder="请输入收藏集名称"/>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default CollectionDetail;