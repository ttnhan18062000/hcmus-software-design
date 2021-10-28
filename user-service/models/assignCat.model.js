const db = require('../database/db');

module.exports = {  

    async findByEditorID(editorID){
        const rows = await db.select('ca.category_id', 'c1.title', {parent_title:'c2.title'} )
                            .from({ca:'category_assignment'})
                            .join({c1:'category'},'ca.category_id','=','c1.id')
                            .leftJoin({c2:'category'},'c1.parent_id','=','c2.id')                            
                            .where('ca.editor_id',editorID);

        if(rows.length===0){
            return null;
        }
        return rows;
    },

    async findUnassignedCatByEditorID(editorID){
        const assignedCatID =   db('category_assignment')
                                .select({id:'category_id'})
                                .where('editor_id',editorID);
     
        const rows = await db.select('c1.id','c1.title',{parent_title:'c2.title'})
                            .from({c1:'category'})
                            .leftJoin({c2:'category'},'c1.parent_id','=','c2.id')
                            .where('c1.id', 'not in',assignedCatID);

        if(rows.length===0){
            return null;
        }
        return rows;
    },

    add(addList){
        return db('category_assignment').insert(addList);
    },
    
    del(editorID, delList){
        return db('category_assignment')
             .where( {
                 editor_id: editorID                
              })
              .whereIn('category_id',delList)
             .del();
    },

    getAllAssignedCatExceptID(editorID,catID){
        return db({ca:'category_assignment'})
                .select('c.id','c.title','c.parent_title')
                .join(db.select('c1.id','c1.title',{parent_title:'c2.title'})
                        .from({c1:'category'})
                        .leftJoin({c2:'category'},'c2.id','=','c1.parent_id')
                        .as('c')
                        ,'c.id','=','ca.category_id' )                
                .where('ca.editor_id',editorID)
                .andWhere('ca.category_id','<>',catID);
        
    }
    
};