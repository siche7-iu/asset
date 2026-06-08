// =====================================================
// NH 고정자산관리 — Supabase DB 연결 모듈
// index.html에서 Supabase CDN 로드 후 이 파일을 불러옵니다.
// window.DB.loadAssets() / window.DB.insertAsset(asset) 을 노출합니다.
// =====================================================
(function () {
  var SUPABASE_URL = 'https://znlcgszxhrbxkhggqbry.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_YFSpIJWlOFrf3HmfAqT63g_digrnSqw';
  var _client = null;

  function getClient() {
    if (!_client && window.supabase) {
      _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return _client;
  }

  // 자산 목록 전체 조회 (이력 포함)
  async function loadAssets() {
    var db = getClient();
    if (!db) throw new Error('Supabase SDK가 로드되지 않았습니다.');

    var { data, error } = await db
      .from('assets')
      .select('id, name, category, model, department, owner, location, status, acquire_date, price, asset_history(date, type, detail)')
      .order('acquire_date');

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map(function (a) {
      return {
        id:         a.id,
        name:       a.name,
        category:   a.category,
        model:      a.model,
        department: a.department,
        owner:      a.owner,
        location:   a.location,
        status:     a.status,
        acquireDate: a.acquire_date,   // DATE → "YYYY-MM-DD" 문자열 그대로
        price:      a.price,
        history:    (a.asset_history || []).slice().sort(function (x, y) {
          return x.date < y.date ? -1 : 1;
        })
      };
    });
  }

  // 자산 1건 등록 (자산 행 + 최초 이력 행 동시 삽입)
  async function insertAsset(asset) {
    var db = getClient();
    if (!db) throw new Error('Supabase SDK가 로드되지 않았습니다.');

    var { error: ae } = await db.from('assets').insert({
      id:          asset.id,
      name:        asset.name,
      category:    asset.category,
      model:       asset.model,
      department:  asset.department,
      owner:       asset.owner,
      location:    asset.location,
      status:      asset.status,
      acquire_date: asset.acquireDate,
      price:       asset.price
    });
    if (ae) throw ae;

    if (asset.history && asset.history.length > 0) {
      var { error: he } = await db.from('asset_history').insert(
        asset.history.map(function (h) {
          return { asset_id: asset.id, date: h.date, type: h.type, detail: h.detail };
        })
      );
      if (he) throw he;
    }
  }

  // 요구사항 목록 전체 조회
  async function loadRequirements() {
    var db = getClient();
    if (!db) throw new Error('Supabase SDK가 로드되지 않았습니다.');
    var { data, error } = await db
      .from('requirements')
      .select('*')
      .order('id');
    if (error) throw error;
    return (data || []).map(function(r) {
      return {
        id: r.id, name: r.name, cat: r.cat, catName: r.cat_name,
        pri: r.pri, type: r.type, stage: r.stage, star: r.star,
        src: r.src, srcTip: r.src_tip,
        user: r.req_user, asIs: r.as_is, by: r.by
      };
    });
  }

  // 요구사항 1건 저장 (없으면 삽입, 있으면 업데이트)
  async function upsertRequirement(req) {
    var db = getClient();
    if (!db) throw new Error('Supabase SDK가 로드되지 않았습니다.');
    var { error } = await db.from('requirements').upsert({
      id: req.id, name: req.name, cat: req.cat, cat_name: req.catName,
      pri: req.pri, type: req.type, stage: req.stage, star: !!req.star,
      src: req.src || '', src_tip: req.srcTip || '',
      req_user: req.user || '', as_is: req.asIs || '', by: req.by || '',
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  }

  window.DB = { loadAssets: loadAssets, insertAsset: insertAsset, loadRequirements: loadRequirements, upsertRequirement: upsertRequirement };
})();
