import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import './custom_tree.css'
import NavBar from './navBar';
import { useState , useMemo } from 'react';
import { useLocation } from "react-router-dom";

function RoleHierarchyTree(){
  const location = useLocation();
  const userPhone = location.state?.phone;
    const items = {
        root: {
          index: 'root',
          isFolder: true,
          children: ['child1', 'child2'],
          data: 'Root item',
        },
        child1: {
          index: 'child1',
          children: [],
          data: 'Child item 1',
        },
        child2: {
          index: 'child2',
          isFolder: true,
          children: ['child3' , 'child4' , 'child5' , 'child6' , 'child7'],
          data: 'Child item 2',
        },
        child3: {
          index: 'child3',
          children: [],
          data: 'Child item 3',
        },
        child4: {
            index: 'child4',
            children: [],
            data: 'Child item 4',
          },
        child5: {
            index: 'child5',
            children: [],
            data: 'Child item 5',
          },
        child6: {
            index: 'child6',
            children: [],
            data: 'Child item 6',
          },
        child7: {
            index: 'child7',
            children: [],
            data: 'Child item 7',
          },
      };
      let person = {
        name:"امیر",
        number:"09338666836"
    }

    const [searchTerm, setSearchTerm] = useState('');

    // 🔍 Filter items based on global search term
    const filteredItems = useMemo(() => {
      if (!searchTerm.trim()) return items;
  
      const term = searchTerm.toLowerCase();
      const result = {};
  
      const addItemAndAncestors = (id, ancestors = []) => {
        const item = items[id];
        if (!item) return false;
  
        // Check if current item matches
        const matches = item.data.toLowerCase().includes(term);
  
        // If it's a folder, check its children recursively
        let hasMatchingDescendant = false;
        const matchingChildren = [];
  
        if (item.isFolder && Array.isArray(item.children)) {
          for (const childId of item.children) {
            if (addItemAndAncestors(childId, [...ancestors, id])) {
              matchingChildren.push(childId);
              hasMatchingDescendant = true;
            }
          }
        }
  
        // Keep this item if:
        // - it matches, OR
        // - it's a folder with matching descendants
        if (matches || hasMatchingDescendant) {
          result[id] = {
            ...item,
            children: matchingChildren,
          };
          return true;
        }
  
        return false;
      };
  
      // Start from root
      addItemAndAncestors('root');
      return result;
    }, [searchTerm, items]);


    
    const item_clicked = (T) =>{
      console.log("the click was for the user : " , T)
    }



    const Item_changer =({ title, arrow, depth, context, children }) => {
        const InteractiveComponent = context.isRenaming ? 'div' : 'a';
        return (
          <>
            <li
              {...context.itemContainerWithChildrenProps}
              className='li_in_tree'
            >
              <InteractiveComponent
                {...context.itemContainerWithoutChildrenProps}
                {...context.interactiveElementProps}
                className='tree_link'
                onClick={() => item_clicked(title)}
              >
                { arrow }
                { title }
              </InteractiveComponent>
            </li>
            {children}
          </>
        );
      }



      const dataProvider = new StaticTreeDataProvider(items, (item, newName) => ({ ...item, data: newName }));
    
      return (
        <>
        <NavBar account={userPhone}></NavBar>
        <div className='user_search' style={{ padding: '12px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          <input
            type="text"
            placeholder="🔍 Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div className='tree_holder'>
        <UncontrolledTreeEnvironment
          dataProvider={dataProvider}
          getItemTitle={item => item.data}
          viewState={{
            // ['tree-1']: {
            //   expandedItems: ['container'],
            // },
          }}
        //   canDragAndDrop={true}
        //   canDropOnFolder={true}
        //   canReorderItems={true}
        renderItem={Item_changer}
        renderTreeContainer={({ children, containerProps }) => <div {...containerProps}>{children}</div>}
        renderItemsContainer={({ children, containerProps }) => <ul {...containerProps}>
          {children}
          </ul>}
        >
          <Tree treeId="tree-2" rootItem="root" treeLabel="Tree Example" />
        </UncontrolledTreeEnvironment>
        </div>
        </>
      );
}
export default RoleHierarchyTree
