import NewSkin_helper_login

class Module(NewSkin_helper_login.Module):
    def change_mode (self,index):
        driver = self.driver
        self.html = driver.page_source
        self.doc = self.p.parse( self.html ) 
        if index == 'reader':
            driver.find_element_by_class_name("reader-mode-icon").click()
        elif index == 'stream':
            driver.find_element_by_class_name("stream-mode-icon").click()
        elif index == 'groups':
            driver.find_element_by_class_name("groups-mode-icon").click()
        elif index == 'classroom':
            driver.find_element_by_class_name("classroom-mode-icon").click()

    
    def find_list_of_books(self):
        driver = self.driver
        books = {}
        self.doc = self.p.parse (driver.page_source)
        library = self.return_lxml_element_by_class_name ('library-menu')
        i = 0
        for node in library.iter ('div'):
            if node is not None and node.get('class') == 'title':
               books [node.text] = i
               i = i+1
        return books

    def return_lxml_element_by_class_name (self,name):
        elt = None
        driver = self.driver
        self.doc = self.p.parse (driver.page_source)
        for node in self.doc.iter('div'):
            if node.get ('class') is not None and re.search (name.strip(), node.get ('class')):
                elt = node
        return elt

    def find_list_of_chapters(self):
        driver = self.driver
        chapters_dict = {}
        i = 0
        chapters = driver.find_elements_by_class_name ('x-grid-row')
        for node in chapters:
            if node.text is None:
                break
            elif node.text.strip() != '':
                chapters_dict[node.text] = i
                i = i+1

        return chapters_dict

    def find_list_of_sections(self):
        driver= self.driver
        #first check if there is an expanded chapter
        sections_dict = {}
        i = 0
        sections = driver.find_elements_by_class_name('x-grid-tree-node-leaf')
        for node in sections:
            if node.text is None:
                break
            elif node.text.strip() != '':
                sections_dict[node.text] = i
                i = i+1
        return sections_dict

    def open_book (self, bookName):
        driver = self.driver
        success = True
        books =  self.find_list_of_books()
        if books and (bookName.strip() in books.keys()):
            driver.find_elements_by_class_name('title')[books[bookName.strip()]].click()
        else:
            success = False

        return success

    def open_chapter(self,chapterName): 
        driver = self.driver
        success = False
        self.doc = self.p.parse (driver.page_source)
        if self.doc.find ("//tr[@class='x-grid-row  x-grid-tree-node-expanded']") is None:
            chapters =  self.find_list_of_chapters()
            if chapters and (chapterName.strip() in chapters.keys()):
                driver.find_elements_by_class_name('x-grid-row')[chapters[chapterName.strip()]].click()
                success = True

        return success


    def open_section(self, sectionName):
        driver = self.driver
        success = False
        self.doc = self.p.parse (driver.page_source)
        if self.doc.find("//tr[@class='x-grid-row  x-grid-tree-node-leaf']") is None:
            sections = self.find_list_of_sections()
            if sections and (sectionName.strip() in sections.keys()):
               driver.find_elements_by_class_name('x-grid-tree-node-leaf')[sections[sectionName.strip()]].click()
               success = True

        #Make sure the menu is hidden by clicking on the reader icon
               driver.change_mode ('reader')
        return success

    def close_chapter(self,chapterName):
        driver = self.driver
        success = False
        self.doc = self.p.parse (driver.page_source)
        if self.doc.find("//tr[@class='x-grid-row  x-grid-tree-node-expanded']") is not None:
            chapters =  self.find_list_of_chapters()
            if chapters and (chapterName.strip() in chapters.keys()):
               driver.find_elements_by_class_name('x-grid-tree-node-leaf')[chapters[chapterName.strip()]].click()
               success = True

        return success
    
    def is_element_present(self,how, what):
        driver = self.driver
        try: driver.find_element(by=how, value=what)
        except NoSuchElementException, e: return False
        return True
   
