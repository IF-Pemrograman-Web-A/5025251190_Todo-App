<aside class="sidebar">
    <h2>To Do List</h2>
    <nav>
        <ul>
            <li><a href="index.php?page=personal" class="<?= (!isset($_GET['page']) || $_GET['page'] == 'personal') ? 'active' : ''; ?>">Personal Todos</a></li>
            <li><a href="index.php?page=shared" class="<?= (isset($_GET['page']) && $_GET['page'] == 'shared') ? 'active' : ''; ?>">Shared Todos</a></li>
        </ul>
    </nav>
</aside>